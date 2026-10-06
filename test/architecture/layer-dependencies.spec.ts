import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, relative, resolve, sep } from 'path';

/**
 * Guards the DDD dependency rules of the monorepo:
 *
 *   interfaces -> application -> domain
 *   infrastructure implements contracts defined by domain/application
 *
 * Every test collects violations so a failure lists the offending imports.
 */
const ROOT = resolve(__dirname, '..', '..');
const APPS_DIR = join(ROOT, 'apps');
const LIBS_DIR = join(ROOT, 'libs');
const BUSINESS_SERVICES = [
  'user-service',
  'energy-monitoring-service',
  'alert-service',
];

interface ImportRef {
  file: string;
  specifier: string;
}

function listTsFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) return listTsFiles(fullPath);
    return fullPath.endsWith('.ts') ? [fullPath] : [];
  });
}

function importsIn(dir: string): ImportRef[] {
  const pattern =
    /(?:import|export)\s[^'";]*?from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;
  return listTsFiles(dir).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(pattern)].map((match) => ({
      file,
      specifier: match[1] ?? match[2],
    })),
  );
}

const isRelative = ({ specifier }: ImportRef) => specifier.startsWith('.');
const target = ({ file, specifier }: ImportRef) =>
  resolve(dirname(file), specifier);
const isInside = (path: string, dir: string) =>
  path === dir || path.startsWith(dir + sep);
const describeRef = ({ file, specifier }: ImportRef) =>
  `${relative(ROOT, file)} imports "${specifier}"`;

describe.each(BUSINESS_SERVICES)('Bounded Context: %s', (service) => {
  const appDir = join(APPS_DIR, service);
  const srcDir = join(appDir, 'src');

  it('keeps domain free of frameworks, libraries and other layers', () => {
    const domainDir = join(srcDir, 'domain');
    const violations = importsIn(domainDir)
      .filter((ref) => !isRelative(ref) || !isInside(target(ref), domainDir))
      .map(describeRef);

    expect(violations).toEqual([]);
  });

  it('keeps application independent from infrastructure and interfaces', () => {
    const forbidden = ['infrastructure', 'interfaces'].map((d) =>
      join(srcDir, d),
    );
    const violations = importsIn(join(srcDir, 'application'))
      .filter(isRelative)
      .filter((ref) => forbidden.some((dir) => isInside(target(ref), dir)))
      .map(describeRef);

    expect(violations).toEqual([]);
  });

  it('keeps interfaces independent from infrastructure', () => {
    const infrastructureDir = join(srcDir, 'infrastructure');
    const violations = importsIn(join(srcDir, 'interfaces'))
      .filter(isRelative)
      .filter((ref) => isInside(target(ref), infrastructureDir))
      .map(describeRef);

    expect(violations).toEqual([]);
  });

  it('keeps TypeORM inside infrastructure', () => {
    const violations = ['domain', 'application', 'interfaces']
      .flatMap((layer) => importsIn(join(srcDir, layer)))
      .filter(({ specifier }) => /^(@nestjs\/)?typeorm(\/|$)/.test(specifier))
      .map(describeRef);

    expect(violations).toEqual([]);
  });
});

describe.each([...BUSINESS_SERVICES, 'api-gateway'])(
  'Application: %s',
  (service) => {
    it('does not import code from other applications', () => {
      const appDir = join(APPS_DIR, service);
      const violations = importsIn(appDir)
        .filter(isRelative)
        .filter(
          (ref) =>
            isInside(target(ref), APPS_DIR) && !isInside(target(ref), appDir),
        )
        .map(describeRef);

      expect(violations).toEqual([]);
    });
  },
);

describe('Shared libraries', () => {
  it('never depend on applications', () => {
    const violations = importsIn(LIBS_DIR)
      .filter((ref) =>
        isRelative(ref)
          ? isInside(target(ref), APPS_DIR)
          : ref.specifier.startsWith('apps/'),
      )
      .map(describeRef);

    expect(violations).toEqual([]);
  });
});
