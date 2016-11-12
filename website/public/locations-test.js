var unirest = require('unirest');

var access_token = 'sandbox-sq0atb-qnEQHbUhWZ-OwIUzOleOCg'

var location_id = unirest.get('https://connect.squareup.com/v2/locations', headers= {
  'Accept': 'application/json',
  'Authorization': 'Bearer ' + access_token
})

var card_nonce = app.get('/process-card', function(req, res) {
  return req.nonce
})

var response = unirest.post('https://connect.squareup.com/v2/locations/' + location_id + '/transactions',
  headers={
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + access_token,
  },
  params = json.dumps({
    'card_nonce': card_nonce,
    'amount_money': {
      'amount': 100,
      'currency': 'USD'
    },
    'idempotency_key': str(uuid.uuid1())
  })
)

console.log(response)
