const importAll = (r) => {
  const images = {}
  r.keys().forEach((key) => {
    images[/\.\/(.*)\.\w{3}$/.exec(key)[1]] = r(key)
  })
  return images
}

export default importAll(require.context('./logos', false, /\.(png|jpe?g|svg)$/))
