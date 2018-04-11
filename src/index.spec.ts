import { Request } from 'servie'
import * as boom from 'boom'
import * as httpErrors from 'http-errors'
import { errorhandler } from './index'

describe('servie-errorhandler', () => {
  const req = new Request({ url: '/' })

  it('should render an error', () => {
    const handler = errorhandler(req, { production: true })
    const res = handler(new Error('boom!'))

    expect(res).toMatchSnapshot()
  })

  it('should render boom status errors', () => {
    const handler = errorhandler(req, { production: true })
    const res = handler(boom.badRequest('data has an issue'))

    expect(res).toMatchSnapshot()
  })

  it('should render http errors status error', () => {
    const handler = errorhandler(req, { production: true })
    const res = handler(new httpErrors.BadRequest('data has an issue'))

    expect(res).toMatchSnapshot()
  })
})
