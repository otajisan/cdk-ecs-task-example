import boto3

def handler(event, context):
    print('test')
    sqs = boto3.resource('sqs')

    queue_name = 'send-message-queue'
    queue = sqs.get_queue_by_name(QueueName=queue_name)

    entries = [{'Id': '1', 'MessageBody': 'My Test Message'}]
    response = queue.send_messages(Entries=entries)
    print(response)

    return response