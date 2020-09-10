import boto3
import random

def handler(event, context):
    print('test')
    sqs = boto3.resource('sqs')

    queue_name = 'send-message-queue'
    queue = sqs.get_queue_by_name(QueueName=queue_name)

    rand_id = str(random.randint(0, 10000))

    entries = [{'Id': rand_id, 'MessageBody': 'My Test Message [{}]'.format(rand_id)}]
    response = queue.send_messages(Entries=entries)
    print(response)

    return response