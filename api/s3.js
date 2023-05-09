const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'AKIA3EGVZYC2VCCZXQ5V',
  secretAccessKey: 'Cp0XqEzNCkXr6I31cYhSHu9lYB8+vcYe8OIs4Ivq'
});


const s3 = new AWS.S3();

// Example: List all S3 buckets
s3.listBuckets(function (err, data) {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Buckets:', data.Buckets);
  }
});



module.exports = AWS;
