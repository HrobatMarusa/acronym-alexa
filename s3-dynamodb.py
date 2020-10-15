## upload a .csv file from S3 to Dynamodb

import boto3

s3 = boto3.client('s3')     #initialize s3 client used to read the csv file from the s3 bucket
dynamodb = boto3.resource('dynamodb')       #initialize dynamodb client
table = dynamodb.Table('acronymbot')    #change to the name of your dynamodb table

def lambda_handler(event, context):
    try:
        bucket_name = event['Records'][0]['s3']['bucket']['name']       
        file_name = event['Records'][0]['s3']['object']['key']
        print('Bucket: ', bucket_name, 'File: ', file_name)
        
        csv_file = s3.get_object(Bucket = bucket_name, Key = file_name)       #get the csv file from s3 (bucket and file name defined in csvtest)
        
        data = csv_file['Body'].read().decode('utf-8')      #read in the csv file content
        acronyms = data.split("\n")       #split by line
        
        #read csv rows
        for acronym in acronyms:
            #print(acronym)
            acronyms_data = acronym.split(",")
            #add to dynamodb
            table.put_item(
                Item = {
                    'acro': acronyms_data[0],
                    'output': acronyms_data[1],
                    'definition': acronyms_data[2],
                    'description': acronyms_data[3]     #change these to fit with your table structure
                })
        print('Successfully added the records to the dynamodb table, yay!')
        
    #catch errors    
    except Exception as e:
        print(str(e))