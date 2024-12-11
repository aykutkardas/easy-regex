import xor from 'lodash.xor';
import { LessonData } from 'src/types';

/**
 * Creates a grouped RegExp by adjusting backreferences.
 *
 * @param regex - The regex pattern as a string.
 * @param flags - Optional regex flags.
 * @returns A new RegExp object with adjusted backreferences.
 */
const createGrouppedRegex = (regex: string, flags?: string) => {
  const matches = [...regex.matchAll(/\\(\d+)/g)]
    .map(item => Number(item[1]))
    .sort((a, b) => b - a);

  let newRegex = regex;

  matches.forEach(number => {
    newRegex = newRegex.replace(`\\${number}`, `\\${number + 1}`);
  });

  return new RegExp(`(${newRegex})`, flags);
};

/**
 * Defines the structure of the regex object.
 */
interface RegexObj {
  regex: string;
  flags?: string;
}

/**
 * Defines the possible error types.
 */
type RegexError =
  | { type: 'InvalidRegex'; message: string }
  | { type: 'IncorrectMatches'; message: string; expected: string[]; actual: string[] }
  | { type: 'InvalidFlags'; message: string }
  | { type: 'ValidationFailed'; message: string };

/**
 * Defines the structure of the result returned by checkRegex.
 */
interface CheckRegexResult {
  isMatch: boolean;
  isSuccess: boolean;
  regex?: RegExp;
  error?: RegexError;
}

/**
 * Checks the provided regex against the data and returns detailed results.
 *
 * @param data - The data object containing content, expected answers, and validation methods.
 * @param regexObj - An object containing the regex pattern and optional flags.
 * @returns An object detailing the match results and any errors encountered.
 */
const checkRegex = (data: LessonData, { regex, flags }: RegexObj): CheckRegexResult => {
  let grouppedRegex: RegExp;
  let results: string[] = [];

  // Step 1: Validate Regex Syntax
  try {
    grouppedRegex = createGrouppedRegex(regex, flags);
  } catch (syntaxError) {
    return {
      isMatch: false,
      isSuccess: false,
      error: {
        type: 'InvalidRegex',
        message: `The provided regex has invalid syntax: ${(syntaxError as Error).message}`,
      },
    };
  }

  // Step 2: Validate Flags
  const expectedFlags = data.flags ? data.flags.split('') : [];
  const providedFlags = flags ? flags.split('') : [];
  const invalidFlags = xor(expectedFlags, providedFlags);
  if (invalidFlags.length > 0) {
    return {
      isMatch: false,
      isSuccess: false,
      error: {
        type: 'InvalidFlags',
        message: `The provided flags "${flags}" do not match the expected flags "${data.flags}".`,
      },
    };
  }

  // Step 3: Validate Regex Inclusion or Custom Validation
  const isValidRegex = data.regex
    ? data.regex.includes(regex)
    : data.customValidate
    ? data.customValidate(regex)
    : false;

  if (!isValidRegex) {
    return {
      isMatch: false,
      isSuccess: false,
      error: {
        type: 'ValidationFailed',
        message: 'The provided regex does not pass the validation checks.',
      },
    };
  }

  // Step 4: Perform Matching
  try {
    if (flags?.includes('g')) {
      results = [...data.content.matchAll(grouppedRegex)].map(result => result[0]).filter(Boolean);
    } else {
      const match = data.content.match(grouppedRegex);
      if (match) {
        results = [match[0]];
      }
    }
  } catch (matchError) {
    return {
      isMatch: false,
      isSuccess: false,
      error: {
        type: 'InvalidRegex',
        message: `Error during regex matching: ${(matchError as Error).message}`,
      },
    };
  }

  // Step 5: Compare Results with Expected Answers
  const expected = data.answer || [];
  const isMatch = expected.length === results.length && xor(expected, results).length === 0;

  if (!isMatch) {
    return {
      isMatch,
      isSuccess: false,
      regex: grouppedRegex,
      error: {
        type: 'IncorrectMatches',
        message: 'The regex does not produce the expected matches.',
        expected,
        actual: results,
      },
    };
  }

  // If all checks pass
  return {
    isMatch: true,
    isSuccess: true,
    regex: grouppedRegex,
  };
};

export default checkRegex;
