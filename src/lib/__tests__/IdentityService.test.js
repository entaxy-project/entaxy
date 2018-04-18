import { getName } from '../IdentityService'

describe('IdentityService', () => {
  describe('getName', () => {
    it('should return the name if one is present', () => {
      const person = {
        name: () => {
          return 'present'
        }
      }
      expect(getName(person)).toEqual('present')
    })
    it('should return nameless person if one is not present', () => {
      const person = {
        name: () => {
          return null
        }
      }
      expect(getName(person)).toEqual('Nameless Person')
    })
  })
})
