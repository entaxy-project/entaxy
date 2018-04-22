function getName(person) {
  const name = person.name()
  if (name) {
    return name
  }
  return 'Nameless Person'
}

export { getName }
export default getName
