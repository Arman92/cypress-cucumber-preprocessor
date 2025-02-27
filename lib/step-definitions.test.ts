import util from "util";

import path from "path";

import assert from "assert";

import {
  ICypressPost10Configuration,
  ICypressPre10Configuration,
} from "@badeball/cypress-configuration";

import {
  IPreprocessorConfiguration,
  PreprocessorConfiguration,
} from "./preprocessor-configuration";

import {
  getStepDefinitionPatternsPost10,
  getStepDefinitionPatternsPre10,
  pathParts,
} from "./step-definitions";

const DUMMY_PRE10_CONFIG: ICypressPre10Configuration = {
  projectRoot: "",
  integrationFolder: "",
  fixturesFolder: "",
  supportFile: false,
  testFiles: [],
  ignoreTestFiles: [],
  env: {},
};

function pre10example(
  filepath: string,
  partialCypressConfiguration: Partial<ICypressPre10Configuration>,
  preprocessorConfiguration: Partial<IPreprocessorConfiguration>,
  expected: string[]
) {
  const cypressConfiguration: ICypressPre10Configuration = {
    ...DUMMY_PRE10_CONFIG,
    ...partialCypressConfiguration,
  };

  it(`should return [${expected.join(
    ", "
  )}] for ${filepath} with ${util.inspect(preprocessorConfiguration)} in ${
    cypressConfiguration.projectRoot
  }`, () => {
    const actual = getStepDefinitionPatternsPre10(
      {
        cypress: cypressConfiguration,
        preprocessor: new PreprocessorConfiguration(
          preprocessorConfiguration,
          {},
          cypressConfiguration,
          path.dirname(filepath)
        ),
      },
      filepath
    );

    const throwUnequal = () => {
      throw new Error(
        `Expected ${util.inspect(expected)}, but got ${util.inspect(actual)}`
      );
    };

    if (expected.length !== actual.length) {
      throwUnequal();
    }

    for (let i = 0; i < expected.length; i++) {
      if (expected[i] !== actual[i]) {
        throwUnequal();
      }
    }
  });
}

const DUMMY_POST10_CONFIG: ICypressPost10Configuration = {
  projectRoot: "",
  specPattern: [],
  excludeSpecPattern: [],
  env: {},
};

function post10example(
  filepath: string,
  partialCypressConfiguration: Partial<ICypressPost10Configuration>,
  preprocessorConfiguration: Partial<IPreprocessorConfiguration>,
  implicitIntegrationFolder: string,
  expected: string[]
) {
  const cypressConfiguration: ICypressPost10Configuration = {
    ...DUMMY_POST10_CONFIG,
    ...partialCypressConfiguration,
  };

  it(`should return [${expected.join(
    ", "
  )}] for ${filepath} with ${util.inspect(preprocessorConfiguration)} in ${
    cypressConfiguration.projectRoot
  }`, () => {
    const actual = getStepDefinitionPatternsPost10(
      {
        cypress: cypressConfiguration,
        preprocessor: new PreprocessorConfiguration(
          preprocessorConfiguration,
          {},
          cypressConfiguration,
          implicitIntegrationFolder
        ),
      },
      filepath
    );

    const throwUnequal = () => {
      throw new Error(
        `Expected ${util.inspect(expected)}, but got ${util.inspect(actual)}`
      );
    };

    if (expected.length !== actual.length) {
      throwUnequal();
    }

    for (let i = 0; i < expected.length; i++) {
      if (expected[i] !== actual[i]) {
        throwUnequal();
      }
    }
  });
}

describe("pathParts()", () => {
  const relativePath = "foo/bar/baz";
  const expectedParts = ["foo/bar/baz", "foo/bar", "foo"];

  it(`should return ${util.inspect(expectedParts)} for ${util.inspect(
    relativePath
  )}`, () => {
    assert.deepStrictEqual(pathParts(relativePath), expectedParts);
  });
});

describe("getStepDefinitionPatternsPre10()", () => {
  pre10example(
    "/foo/bar/cypress/integration/baz.feature",
    {
      projectRoot: "/foo/bar",
      integrationFolder: "cypress/integration",
    },
    {},
    [
      "/foo/bar/cypress/integration/baz/**/*.{js,mjs,ts,tsx}",
      "/foo/bar/cypress/integration/baz.{js,mjs,ts,tsx}",
      "/foo/bar/cypress/support/step_definitions/**/*.{js,mjs,ts,tsx}",
    ]
  );

  pre10example(
    "/cypress/integration/foo/bar/baz.feature",
    {
      projectRoot: "/",
      integrationFolder: "cypress/integration",
    },
    {
      stepDefinitions: "cypress/integration/[filepath]/step_definitions/*.ts",
    },
    ["/cypress/integration/foo/bar/baz/step_definitions/*.ts"]
  );

  pre10example(
    "/cypress/integration/foo/bar/baz.feature",
    {
      projectRoot: "/",
      integrationFolder: "cypress/integration",
    },
    {
      stepDefinitions: "cypress/integration/[filepart]/step_definitions/*.ts",
    },
    [
      "/cypress/integration/foo/bar/baz/step_definitions/*.ts",
      "/cypress/integration/foo/bar/step_definitions/*.ts",
      "/cypress/integration/foo/step_definitions/*.ts",
      "/cypress/integration/step_definitions/*.ts",
    ]
  );

  it("should error when provided a path not within integrationFolder", () => {
    assert.throws(() => {
      getStepDefinitionPatternsPre10(
        {
          cypress: {
            projectRoot: "/foo/bar",
            integrationFolder: "cypress/integration",
          },
          preprocessor: {
            stepDefinitions: [],
            implicitIntegrationFolder: "/foo/bar/cypress/integration",
          },
        },
        "/foo/bar/cypress/features/baz.feature"
      );
    }, "/foo/bar/cypress/features/baz.feature is not within cypress/integration");
  });

  it("should error when provided a path not within cwd", () => {
    assert.throws(() => {
      getStepDefinitionPatternsPre10(
        {
          cypress: {
            projectRoot: "/baz",
            integrationFolder: "cypress/integration",
          },
          preprocessor: {
            stepDefinitions: [],
            implicitIntegrationFolder: "/foo/bar/cypress/integration",
          },
        },
        "/foo/bar/cypress/integration/baz.feature"
      );
    }, "/foo/bar/cypress/features/baz.feature is not within /baz");
  });
});

describe("getStepDefinitionPatternsPost10()", () => {
  post10example(
    "/foo/bar/cypress/e2e/baz.feature",
    {
      projectRoot: "/foo/bar",
    },
    {},
    "/foo/bar/cypress/e2e",
    [
      "/foo/bar/cypress/e2e/baz/**/*.{js,mjs,ts,tsx}",
      "/foo/bar/cypress/e2e/baz.{js,mjs,ts,tsx}",
      "/foo/bar/cypress/support/step_definitions/**/*.{js,mjs,ts,tsx}",
    ]
  );

  post10example(
    "/cypress/e2e/foo/bar/baz.feature",
    {
      projectRoot: "/",
    },
    {
      stepDefinitions: "/cypress/e2e/[filepath]/step_definitions/*.ts",
    },
    "/cypress/e2e",
    ["/cypress/e2e/foo/bar/baz/step_definitions/*.ts"]
  );

  post10example(
    "/cypress/e2e/foo/bar/baz.feature",
    {
      projectRoot: "/",
    },
    {
      stepDefinitions: "/cypress/e2e/[filepart]/step_definitions/*.ts",
    },
    "/cypress/e2e",
    [
      "/cypress/e2e/foo/bar/baz/step_definitions/*.ts",
      "/cypress/e2e/foo/bar/step_definitions/*.ts",
      "/cypress/e2e/foo/step_definitions/*.ts",
      "/cypress/e2e/step_definitions/*.ts",
    ]
  );

  it("should error when provided a path not within cwd", () => {
    assert.throws(() => {
      getStepDefinitionPatternsPost10(
        {
          cypress: {
            projectRoot: "/baz",
          },
          preprocessor: {
            stepDefinitions: [],
            implicitIntegrationFolder: "/foo/bar/cypress/e2e",
          },
        },
        "/foo/bar/cypress/e2e/baz.feature"
      );
    }, "/foo/bar/cypress/features/baz.feature is not within /baz");
  });
});
