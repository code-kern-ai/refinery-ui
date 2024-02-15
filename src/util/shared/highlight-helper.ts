import { RegexMatch } from '@/src/types/shared/highlight'

export function rebuildText(text: string, finalRegex: RegExp[]) {
  if (!text) return
  let parts = []
  if (finalRegex.length == 0) {
    parts = [{ text: text, isMatch: false }]
    return
  }
  const optimizedMatches = mergeIntervals(getAllMatches(text, finalRegex))
  parts = []
  let start = 0
  for (const match of optimizedMatches) {
    if (match.start > start) {
      parts.push({ text: text.slice(start, match.start), isMatch: false })
    }
    parts.push({ text: text.slice(match.start, match.end), isMatch: true })
    start = match.end
  }
  if (start < text.length) {
    parts.push({ text: text.slice(start), isMatch: false })
  }
  return parts
}

function mergeIntervals(intervals: RegexMatch[]) {
  if (intervals.length < 2) return intervals

  intervals.sort((a, b) => a.start - b.start)

  const result = []
  let previous = intervals[0]

  for (let i = 1; i < intervals.length; i += 1) {
    if (previous.end >= intervals[i].start) {
      previous = {
        start: previous.start,
        end: Math.max(previous.end, intervals[i].end),
      }
    } else {
      result.push(previous)
      previous = intervals[i]
    }
  }

  result.push(previous)

  return result
}

function getAllMatches(text: string, finalRegex: RegExp[]): RegexMatch[] {
  const toReturn = []
  for (const regex of finalRegex) {
    const matches = text.matchAll(regex)
    for (const match of matches) {
      const optimizedMatch: RegexMatch = {
        start: match.index,
        end: match.index + match[0].length,
      }
      toReturn.push(optimizedMatch)
    }
  }
  return toReturn
}

export function buildRegexps(
  searchFor: string[] | string,
  matchCase: boolean | string,
): RegExp[] {
  if (!Array.isArray(searchFor)) {
    searchFor = [searchFor]
  }
  const toReturn = []
  for (const search of searchFor) {
    toReturn.push(new RegExp(search, matchCase ? 'g' : 'gi'))
  }
  return toReturn
}

export function buildRegex(search: string, matchCase: boolean): RegExp {
  return new RegExp(search, matchCase ? 'g' : 'gi')
}
