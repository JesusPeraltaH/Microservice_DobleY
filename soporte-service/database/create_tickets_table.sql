-- Create tickets table in Supabase (PostgreSQL)
-- This table stores support tickets linked to users and sales from MongoDB

-- Create enum types for ticket type and status
CREATE TYPE ticket_type AS ENUM ('queja', 'devolucion', 'problema');
CREATE TYPE ticket_status AS ENUM ('abierto', 'en_proceso', 'resuelto', 'cerrado');

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    -- Primary key (UUID)
    idTicket UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References to MongoDB collections (stored as strings)
    idUsuario TEXT NOT NULL, -- MongoDB ObjectId as string
    idVenta TEXT, -- MongoDB ObjectId as string (optional)
    
    -- Customer and sale information (cached from MongoDB for performance)
    customerName TEXT,
    total NUMERIC(10,2),
    statusVenta TEXT,
    
    -- Ticket information
    tipo_ticket ticket_type NOT NULL,
    descripcion TEXT NOT NULL CHECK (LENGTH(descripcion) >= 10 AND LENGTH(descripcion) <= 2000),
    estado_ticket ticket_status NOT NULL DEFAULT 'abierto',
    
    -- Timestamps
    fechaCreacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fechaResolucion TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_resolution_date CHECK (
        fechaResolucion IS NULL OR fechaResolucion >= fechaCreacion
    ),
    CONSTRAINT resolution_required_when_closed CHECK (
        (estado_ticket IN ('resuelto', 'cerrado') AND fechaResolucion IS NOT NULL) OR
        (estado_ticket NOT IN ('resuelto', 'cerrado'))
    )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_usuario ON tickets(idUsuario);
CREATE INDEX IF NOT EXISTS idx_tickets_venta ON tickets(idVenta);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets(estado_ticket);
CREATE INDEX IF NOT EXISTS idx_tickets_tipo ON tickets(tipo_ticket);
CREATE INDEX IF NOT EXISTS idx_tickets_fecha_creacion ON tickets(fechaCreacion DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_fecha_resolucion ON tickets(fechaResolucion DESC);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tickets_usuario_estado ON tickets(idUsuario, estado_ticket);
CREATE INDEX IF NOT EXISTS idx_tickets_usuario_fecha ON tickets(idUsuario, fechaCreacion DESC);

-- Add comments for documentation
COMMENT ON TABLE tickets IS 'Support tickets table - stores customer complaints, returns, and problems';
COMMENT ON COLUMN tickets.idTicket IS 'Unique ticket identifier (UUID)';
COMMENT ON COLUMN tickets.idUsuario IS 'Reference to MongoDB users collection (_id as string)';
COMMENT ON COLUMN tickets.idVenta IS 'Reference to MongoDB ventas collection (_id as string, optional)';
COMMENT ON COLUMN tickets.customerName IS 'Customer name (cached from MongoDB for performance)';
COMMENT ON COLUMN tickets.total IS 'Sale total amount (cached from MongoDB)';
COMMENT ON COLUMN tickets.statusVenta IS 'Sale status (cached from MongoDB)';
COMMENT ON COLUMN tickets.tipo_ticket IS 'Type of ticket: queja (complaint), devolucion (return), problema (problem)';
COMMENT ON COLUMN tickets.descripcion IS 'Detailed description of the issue (10-2000 characters)';
COMMENT ON COLUMN tickets.estado_ticket IS 'Ticket status: abierto, en_proceso, resuelto, cerrado';
COMMENT ON COLUMN tickets.fechaCreacion IS 'Ticket creation timestamp';
COMMENT ON COLUMN tickets.fechaResolucion IS 'Ticket resolution timestamp (set when status changes to resuelto/cerrado)';

-- Enable Row Level Security (RLS) for better security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (optional - can be customized based on your needs)
-- Policy: Users can only see their own tickets
CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (auth.uid()::text = idUsuario);

-- Policy: Users can create tickets for themselves
CREATE POLICY "Users can create own tickets" ON tickets
    FOR INSERT WITH CHECK (auth.uid()::text = idUsuario);

-- Policy: Users can update their own tickets (limited fields)
CREATE POLICY "Users can update own tickets" ON tickets
    FOR UPDATE USING (auth.uid()::text = idUsuario)
    WITH CHECK (auth.uid()::text = idUsuario);

-- Policy: Service role can do everything (for the microservice)
CREATE POLICY "Service role full access" ON tickets
    FOR ALL USING (auth.role() = 'service_role');

-- Create a function to automatically set fechaResolucion when status changes
CREATE OR REPLACE FUNCTION set_resolution_date()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is changing to 'resuelto' or 'cerrado' and fechaResolucion is not set
    IF NEW.estado_ticket IN ('resuelto', 'cerrado') AND OLD.estado_ticket NOT IN ('resuelto', 'cerrado') THEN
        IF NEW.fechaResolucion IS NULL THEN
            NEW.fechaResolucion = NOW();
        END IF;
    END IF;
    
    -- If status is changing away from 'resuelto' or 'cerrado', clear fechaResolucion
    IF NEW.estado_ticket NOT IN ('resuelto', 'cerrado') AND OLD.estado_ticket IN ('resuelto', 'cerrado') THEN
        NEW.fechaResolucion = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically manage fechaResolucion
CREATE TRIGGER trigger_set_resolution_date
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_resolution_date();

-- Insert some sample data for testing (optional)
-- INSERT INTO tickets (idUsuario, idVenta, customerName, total, statusVenta, tipo_ticket, descripcion) VALUES
-- ('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', 'Juan Pérez', 150.00, 'completed', 'problema', 'El producto llegó dañado y necesito una solución rápida para este problema.'),
-- ('507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014', 'María García', 75.50, 'completed', 'devolucion', 'Quiero devolver este producto porque no cumple con mis expectativas según la descripción.'),
-- ('507f1f77bcf86cd799439015', NULL, 'Carlos López', NULL, NULL, 'queja', 'El servicio al cliente fue muy deficiente durante mi última interacción con el soporte.');

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON tickets TO authenticated;
GRANT USAGE ON SEQUENCE tickets_idticket_seq TO authenticated;