const { submitRating } = require('./src/controllers/ratingController');

// Mock req and res
const req = {
  user: { id: 'cmn3bapdl0001fnfuolzbpnvo' },
  body: {
    requestId: 'cmn4vtgb4000710o8lzymq7op',
    score: 5,
    comment: 'Great exchange!'
  }
};

const res = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('SUCCESS:', this.statusCode, data);
  }
};

async function test() {
  try {
    await submitRating(req, res, (err) => {
      console.error('NEXT CALLED WITH ERR:', err);
    });
  } catch (err) {
    console.error('CAUGHT ERROR:', err);
  }
}

test();
