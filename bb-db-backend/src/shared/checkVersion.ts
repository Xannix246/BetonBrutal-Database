import { VersionType } from 'src/generated/protos/multiplayer';

const supportedVersions = ['1.2.0', '1.3.0'];
const outdatedVersions: string[] = [];

export function checkVersion(version: string): VersionType {
  const clientVerNumbers = version.split('.');
  const latestVerNumbers = supportedVersions.at(-1)!.split('.');

  if (outdatedVersions.includes(version)) return VersionType.Incompatible;

  if (
    Number.isNaN(clientVerNumbers[0]) ||
    Number.isNaN(clientVerNumbers[1]) ||
    Number.isNaN(clientVerNumbers[2])
  ) {
    return VersionType.Incompatible;
  }

  if (
    clientVerNumbers[0] > latestVerNumbers[0] ||
    clientVerNumbers[1] > latestVerNumbers[1] ||
    clientVerNumbers[2] > latestVerNumbers[2]
  ) {
    return VersionType.Incompatible;
  }

  if (clientVerNumbers[0] < latestVerNumbers[0]) {
    return VersionType.Incompatible;
  }

  if (
    clientVerNumbers[1] < latestVerNumbers[1] ||
    clientVerNumbers[2] < latestVerNumbers[2]
  ) {
    return VersionType.Outdated;
  }

  return VersionType.Latest;
}

export function getLatestVersion() {
  const latestVerNumbers = supportedVersions
    .at(-1)!
    .split('.')
    .map((v) => Number(v));

  return {
    major: latestVerNumbers[0],
    minor: latestVerNumbers[1],
    patch: latestVerNumbers[2],
  };
}

export function getLatestVersionString() {
  return supportedVersions.at(-1)!;
}
