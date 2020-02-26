
const { fetchAllPages } = require('../dist')
const http = require('http')
const fetch = require('isomorphic-fetch')
const { URL } = require('url')
const port = 41794

const testData = new Array(200).fill({ name: 'test data description', description: 'tet data description' })

const getQueryParam = (searchParams) => {
  const rawPage = searchParams.get('page')
  const rawNum = searchParams.get('per_page')
  if (!isFinite(rawPage)) throw new TypeError('page is not a finite number')
  if (!isFinite(rawNum)) throw new TypeError('per_page is not a finite number')
  return { page: +rawPage, num: +rawNum }
}

test('common usecase', (done) => {
  const server = http.createServer((req, res) => {
    const searchParams = new URL(req.url, 'relative:///').searchParams
    const { page, num } = getQueryParam(searchParams)
    const data = testData.slice((page - 1) * num, page * num)

    expect(page).toBeLessThan(4)
    expect(num).toBe(99)

    res.writeHead(200, { 
      'Content-Type': 'application/json', 
      'X-WP-Total': testData.length, 
      'X-WP-TotalPages': Math.ceil(testData.length / num) 
    })
    res.write(JSON.stringify(data))
    res.end()
  })
  server.on('listening', async () => {
    const createUrlCallback = ({ query: { page, per_page: perPage } }) => {
      return fetch(`http://localhost:${port}?page=${page}&per_page=${perPage}`)
    }
    const pages = await fetchAllPages({ createUrlCallback })

    expect(pages.length).toBe(200)

    server.close()
    done()
  })
  server.listen(port)
});
