import { Activity } from './interfaces'

const RESULTS_PER_PAGE = 20

export const calculateNumberOfPages = (activities: Activity[]) => Math.ceil(activities.length / RESULTS_PER_PAGE)

export const lowerBound = (currentPage: number): number => (currentPage - 1) * RESULTS_PER_PAGE;

export const upperBound = (currentPage: number): number => currentPage * RESULTS_PER_PAGE;

export const activityClassificationGroupings = [
  {
    group: 'Independent Practice',
    keys: ['connect', 'sentence', 'passage']
  },
  {
    group: 'Whole Class Instruction',
    keys: ['lessons']
  },
  {
    group: 'Diagnostics',
    keys: ['diagnostic']
  }
]

export const getNumberFromString = (string) => {
  if (!string) { return null }

  const numberMatch = string.match(/\d+/g)
  if (numberMatch) { return Number(numberMatch[0]) }

  return null
}

export const ACTIVITY_CLASSIFICATION_FILTERS = 'activityClassificationFilters'

export const ACTIVITY_CATEGORY_FILTERS = 'activityCategoryFilters'

export const CONTENT_PARTNER_FILTERS = 'contentPartnerFilters'

function filterBySearch(search: string, activity: Activity) {
  const stringActivity = Object.values(activity).join(' ').toLowerCase();
  return stringActivity.includes(search.toLowerCase())
}

function filterByActivityClassification(activityClassificationFilters: string[], activity: Activity) {
  if (!activityClassificationFilters.length) { return true }
  return activityClassificationFilters.includes(activity.activity_classification.key)
}

function filterByActivityCategory(activityCategoryFilters: number[], activity: Activity) {
  if (!activityCategoryFilters.length) { return true }
  return activityCategoryFilters.includes(activity.activity_category.id)
}

function filterByCCSSGradeLevel(ccssGradeLevelFilters: number[], activity: Activity) {
  if (!ccssGradeLevelFilters.length) { return true }
  const numberFromStandardLevel = getNumberFromString(activity.standard_level_name)
  return ccssGradeLevelFilters.includes(numberFromStandardLevel)
}

function filterByReadabilityGradeLevel(readabilityGradeLevelFilters: string[], activity: Activity) {
  if (!readabilityGradeLevelFilters.length) { return true }

  const firstNumberFromReadabilityGradeLevel = getNumberFromString(activity.readability_grade_level)
  return readabilityGradeLevelFilters.map(r => getNumberFromString(r)).includes(firstNumberFromReadabilityGradeLevel)
}

function filterByContentPartners(contentPartnerFilters: number[], activity: Activity) {
  if (!contentPartnerFilters.length) { return true }
  return contentPartnerFilters.some(id => activity.content_partners.some(cp => cp.id === id))
}

export const filters = {
  search: filterBySearch,
  [ACTIVITY_CLASSIFICATION_FILTERS]: filterByActivityClassification,
  ccssGradeLevelFilters: filterByCCSSGradeLevel,
  readabilityGradeLevelFilters: filterByReadabilityGradeLevel,
  [ACTIVITY_CATEGORY_FILTERS]: filterByActivityCategory,
  [CONTENT_PARTNER_FILTERS]: filterByContentPartners
}

const conceptSort = (activities) => activities.sort((a, b) => {
  if (!a.activity_category_name) { return 1 }
  if (!b.activity_category_name) { return -1 }
  return a.activity_category_name.localeCompare(b.activity_category_name)
})


const numberFromStringAscendingSort = (activities, attributeKey) => activities.sort((a, b) => {
  const numberMatchA = getNumberFromString(a[attributeKey])
  const numberMatchB = getNumberFromString(b[attributeKey])

  if (!numberMatchA) { return 1 }
  if (!numberMatchB) { return -1 }

  return numberMatchA - numberMatchB
})

const numberFromStringDescendingSort = (activities, attributeKey) => activities.sort((a, b) => {
  const numberMatchA = getNumberFromString(a[attributeKey])
  const numberMatchB = getNumberFromString(b[attributeKey])

  if (!numberMatchA) { return 1 }
  if (!numberMatchB) { return -1 }

  return numberMatchB - numberMatchA
})

export const DEFAULT = 'default'
const CCSS_ASCENDING = 'ccss-asc'
const CCSS_DESCENDING = 'ccss-desc'
const READABILITY_ASCENDING = 'readability-asc'
const READABILITY_DESCENDING = 'readability-desc'
const CONCEPT = 'concept'

export const sortFunctions = {
  [DEFAULT]: (activities) => activities,
  [CCSS_ASCENDING]: (activities) => numberFromStringAscendingSort(activities, 'standard_level_name'),
  [CCSS_DESCENDING]: (activities) => numberFromStringDescendingSort(activities, 'standard_level_name'),
  [READABILITY_ASCENDING]: (activities) => numberFromStringAscendingSort(activities, 'readability_grade_level'),
  [READABILITY_DESCENDING]: (activities) => numberFromStringDescendingSort(activities, 'readability_grade_level'),
  [CONCEPT]: conceptSort
}

export const sortOptions = [
  {
    label: 'Default',
    key: DEFAULT,
    value: DEFAULT
  },
  {
    label: 'Readability Level (Low to High)',
    key: READABILITY_ASCENDING,
    value: READABILITY_ASCENDING
  },
  {
    label: 'Readability Level (High to Low)',
    key: READABILITY_DESCENDING,
    value: READABILITY_DESCENDING
  },
  {
    label: 'CCSS Grade Level (Low to High)',
    key: CCSS_ASCENDING,
    value: CCSS_ASCENDING
  },
  {
    label: 'CCSS Grade Level (High to Low)',
    key: CCSS_DESCENDING,
    value: CCSS_DESCENDING
  },
  {
    label: 'Concept',
    key: CONCEPT,
    value: CONCEPT
  }
]
