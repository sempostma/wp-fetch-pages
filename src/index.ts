
const perPage = 99

export type FetchCallback = (options: { query: { page: number, per_page: number } }) => Promise<Response>

const fetchPage = async (startingPage: number, fetchCallback: FetchCallback) => {
  const response = await fetchCallback({ query: { page: startingPage, per_page: perPage } })
  const data = await response.json()
  const total = +`${response.headers.get('X-WP-TotalPages')}`
  if (!response.ok && data.code === 'rest_post_invalid_page_number') {
    return { total, pages: [] }
  } else if (!response.ok) {
    throw data
  } else {
    return { total, pages: data }
  }
}

export type FetchAllPagesOptions = {
  createUrlCallback: FetchCallback
}

export const fetchAllPages = async ({ createUrlCallback }: FetchAllPagesOptions) => {
  const collection = []
  let counter = 1

  while (true) {
    const { total, pages } = await fetchPage(counter, createUrlCallback)
    collection.push(...pages)
    counter++
    if (counter > total) break
  }

  return collection
}