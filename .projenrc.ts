import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  packageManager: javascript.NodePackageManager.PNPM,
  majorVersion: 1,
  author: 'haryoiro',
  authorAddress: 'haryoiro@users.noreply.github.com',
  cdkVersion: '2.233.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  name: '@haryoiro/scheduled-natgateway',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/haryoiro/scheduled-natgateway.git',

  // deps: [], /* Runtime dependencies of this module. */
  description:
    'Scheduled NatGateway at the time you need it (Fork of yayami3/scheduled-natgateway)' /* The description is just a string that helps people understand the purpose of the package. */,
  keywords: ['cdk', 'awscdk', 'aws-cdk', 'nat', 'cost'],
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
  stability: 'experimental',
});
project.synth();
