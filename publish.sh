#!/bin/sh
rm index.zip  
cd lambda
zip ../index.zip * -r -x publish.sh*
cd ..
aws lambda update-function-code --function-name dogName-test --zip-file fileb://index.zip