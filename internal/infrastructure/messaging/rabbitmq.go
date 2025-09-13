package messaging

import (
	"fmt"
	"time"

	"github.com/goran/thappy/internal/infrastructure/config"
	"github.com/rabbitmq/amqp091-go"
)

type RabbitMQConnection struct {
	conn    *amqp091.Connection
	channel *amqp091.Channel
	config  *config.RabbitMQConfig
}

// NewRabbitMQConnection creates a new RabbitMQ connection
func NewRabbitMQConnection(cfg *config.Config) (*RabbitMQConnection, error) {
	// Create connection with timeout
	conn, err := amqp091.DialConfig(cfg.RabbitMQ.URL, amqp091.Config{
		Dial: amqp091.DefaultDial(cfg.RabbitMQ.ConnectionTimeout),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	// Create channel
	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	rmq := &RabbitMQConnection{
		conn:    conn,
		channel: channel,
		config:  &cfg.RabbitMQ,
	}

	// Setup exchange and queue
	if err := rmq.setup(); err != nil {
		rmq.Close()
		return nil, fmt.Errorf("failed to setup RabbitMQ: %w", err)
	}

	return rmq, nil
}

// setup creates the necessary exchanges and queues
func (r *RabbitMQConnection) setup() error {
	// Declare exchange
	err := r.channel.ExchangeDeclare(
		r.config.ExchangeName, // name
		"topic",               // type
		true,                  // durable
		false,                 // auto-deleted
		false,                 // internal
		false,                 // no-wait
		nil,                   // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare exchange: %w", err)
	}

	// Declare queue
	_, err = r.channel.QueueDeclare(
		r.config.QueueName, // name
		true,               // durable
		false,              // delete when unused
		false,              // exclusive
		false,              // no-wait
		nil,                // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	// Bind queue to exchange
	err = r.channel.QueueBind(
		r.config.QueueName,    // queue name
		r.config.RoutingKey,   // routing key
		r.config.ExchangeName, // exchange
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("failed to bind queue: %w", err)
	}

	return nil
}

// Publish publishes a message to the exchange
func (r *RabbitMQConnection) Publish(routingKey string, body []byte) error {
	return r.channel.Publish(
		r.config.ExchangeName, // exchange
		routingKey,            // routing key
		false,                 // mandatory
		false,                 // immediate
		amqp091.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp091.Persistent,
			Timestamp:    time.Now(),
			Body:         body,
		},
	)
}

// Consume starts consuming messages from the queue
func (r *RabbitMQConnection) Consume() (<-chan amqp091.Delivery, error) {
	msgs, err := r.channel.Consume(
		r.config.QueueName, // queue
		"",                 // consumer
		false,              // auto-ack
		false,              // exclusive
		false,              // no-local
		false,              // no-wait
		nil,                // args
	)
	if err != nil {
		return nil, fmt.Errorf("failed to register consumer: %w", err)
	}

	return msgs, nil
}

// Close closes the RabbitMQ connection
func (r *RabbitMQConnection) Close() {
	if r.channel != nil {
		r.channel.Close()
	}
	if r.conn != nil {
		r.conn.Close()
	}
}

// IsConnected checks if the connection is still alive
func (r *RabbitMQConnection) IsConnected() bool {
	return r.conn != nil && !r.conn.IsClosed()
}
