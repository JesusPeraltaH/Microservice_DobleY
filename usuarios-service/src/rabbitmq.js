const amqplib = require('amqplib');

let connection;
let channel;

async function connectRabbitMQ() {
  const url = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
  if (channel) return channel;
  try {
    connection = await amqplib.connect(url);
    connection.on('error', (err) => console.error('[RabbitMQ] connection error:', err.message));
    connection.on('close', () => console.warn('[RabbitMQ] connection closed'));

    channel = await connection.createChannel();
    console.log('[RabbitMQ] Connected and channel created');
    return channel;
  } catch (err) {
    console.error('[RabbitMQ] Failed to connect:', err.message);
    throw err;
  }
}

async function publishEvent(exchange, routingKey, data) {
  if (!channel) await connectRabbitMQ();
  await channel.assertExchange(exchange, 'topic', { durable: true });
  const payload = Buffer.from(JSON.stringify(data));
  channel.publish(exchange, routingKey, payload, { contentType: 'application/json', persistent: true });
}

async function consumeEvents(exchange, queue, pattern, callback) {
  if (!channel) await connectRabbitMQ();
  await channel.assertExchange(exchange, 'topic', { durable: true });
  const q = await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(q.queue, exchange, pattern);
  await channel.consume(q.queue, async (msg) => {
    if (!msg) return;
    try {
      const content = JSON.parse(msg.content.toString());
      await callback(content, msg.fields, msg.properties);
      channel.ack(msg);
    } catch (err) {
      console.error('[RabbitMQ] consume error:', err.message);
      channel.nack(msg, false, false); // dead-letter by not requeueing
    }
  });
}

module.exports = { connectRabbitMQ, publishEvent, consumeEvents, getChannel: () => channel };
