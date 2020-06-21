exports.handler = async event => {
  console.log(event)
  return {
    statusCode: 200,
    body: `you sent: ${event.body}`
  }
}