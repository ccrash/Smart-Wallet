// BASE_URL is captured at module load time from process.env.EXPO_PUBLIC_API_URL.
// We set it before the first require so the URL constructor receives a valid
// absolute URL, then use jest.resetModules() to re-evaluate the module fresh.

const MOCK_FETCH = jest.fn()

describe('httpTransport', () => {
   
  let t: { get: (...a: any[]) => Promise<any>; post: (...a: any[]) => Promise<any>; put: (...a: any[]) => Promise<any>; del: (...a: any[]) => Promise<any> }

  beforeAll(() => {
    globalThis.fetch = MOCK_FETCH as unknown as typeof fetch
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test'
    jest.resetModules()
     
    t = require('@/api/transport/http.transport').httpTransport // eslint-disable-line @typescript-eslint/no-require-imports
  })

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL
    jest.resetModules()
  })

  beforeEach(() => MOCK_FETCH.mockReset())

  function ok(body: unknown) {
    MOCK_FETCH.mockResolvedValue({ ok: true, json: () => Promise.resolve(body) })
  }

  // ─── Success paths ────────────────────────────────────────────────────────

  it('GET returns { data, error: null } on success', async () => {
    ok({ balance: 500 })
    const result = await t.get('/wallet/balance')
    expect(result).toEqual({ data: { balance: 500 }, error: null })
    expect(MOCK_FETCH).toHaveBeenCalledWith(
      'http://api.test/wallet/balance',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('GET appends query params to the URL', async () => {
    ok([])
    await t.get('/wallet/transactions', { page: 1, limit: 20 })
    const [url] = MOCK_FETCH.mock.calls[0] as [string]
    expect(url).toContain('page=1')
    expect(url).toContain('limit=20')
  })

  it('POST sends JSON body with correct Content-Type', async () => {
    ok({ id: 'new-pot' })
    await t.post('/pots', { name: 'Holiday' })
    const [, options] = MOCK_FETCH.mock.calls[0] as [string, RequestInit]
    expect(options.method).toBe('POST')
    expect(options.body).toBe('{"name":"Holiday"}')
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('PUT sends the body with PUT method', async () => {
    ok({})
    await t.put('/pots/1', { balance: 100 })
    const [, options] = MOCK_FETCH.mock.calls[0] as [string, RequestInit]
    expect(options.method).toBe('PUT')
    expect(options.body).toBe('{"balance":100}')
  })

  it('DELETE sends no body', async () => {
    ok({})
    await t.del('/pots/1')
    const [, options] = MOCK_FETCH.mock.calls[0] as [string, RequestInit]
    expect(options.method).toBe('DELETE')
    expect(options.body).toBeUndefined()
  })

  // ─── Error paths ──────────────────────────────────────────────────────────

  it('returns { data: null, error: message } when response is not ok and body has message', async () => {
    MOCK_FETCH.mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ message: 'Insufficient balance.' }),
    })
    const result = await t.post('/pots/1/deposit', { amount: 9999 })
    expect(result).toEqual({ data: null, error: 'Insufficient balance.' })
  })

  it('falls back to statusText when error body has no message field', async () => {
    MOCK_FETCH.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
      json: () => Promise.resolve({}),
    })
    const result = await t.get('/unknown')
    expect(result).toEqual({ data: null, error: 'Not Found' })
  })

  it('falls back to statusText when error body JSON parse rejects', async () => {
    MOCK_FETCH.mockResolvedValue({
      ok: false,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('not JSON')),
    })
    const result = await t.get('/broken')
    expect(result).toEqual({ data: null, error: 'Bad Gateway' })
  })

  it('returns { data: null, error: message } when fetch throws an Error', async () => {
    MOCK_FETCH.mockRejectedValue(new Error('Network failure'))
    const result = await t.get('/wallet/balance')
    expect(result).toEqual({ data: null, error: 'Network failure' })
  })

  it('returns generic "Network error" when fetch throws a non-Error value', async () => {
    MOCK_FETCH.mockRejectedValue('connection refused')
    const result = await t.get('/wallet/balance')
    expect(result).toEqual({ data: null, error: 'Network error' })
  })
})

describe('transport index — selects httpTransport when EXPO_PUBLIC_API_URL is set', () => {
  it('exports httpTransport when env var is present', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test'
    jest.resetModules()
     
    const { transport } = require('@/api/transport') // eslint-disable-line @typescript-eslint/no-require-imports
    const { httpTransport } = require('@/api/transport/http.transport') // eslint-disable-line @typescript-eslint/no-require-imports
    expect(transport).toBe(httpTransport)
    delete process.env.EXPO_PUBLIC_API_URL
    jest.resetModules()
  })
})
