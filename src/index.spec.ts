import { Request } from 'servie'
import { errorhandler } from './index'

describe('servie-errorhandler', () => {
  it('should render a plain response', () => {
    const req = new Request({ url: '/' })
    const handler = errorhandler(req)
    const res = handler(new Error('boom!'))

    expect(res).toMatchSnapshot()
  })

  it('should render a html response', () => {
    const req = new Request({ url: '/', headers: { 'Accept': 'text/html' } })
    const handler = errorhandler(req)
    const res = handler(new Error('boom!'))

    expect(res).toMatchSnapshot()
  })

  it('should render a json response', () => {
    const req = new Request({ url: '/', headers: { 'Accept': 'application/json' } })
    const handler = errorhandler(req)
    const res = handler(new Error('boom!'))

    expect(res).toMatchSnapshot()
  })

  it('should not render stack in production', () => {
    const req = new Request({ url: '/', headers: { 'Accept': 'application/json' } })
    const handler = errorhandler(req, { production: false })
    const res = handler(new Error('boom!'))

    expect(res).toMatchSnapshot()
  })
})
