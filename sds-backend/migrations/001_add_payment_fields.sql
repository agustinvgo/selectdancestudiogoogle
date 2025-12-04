-- =====================================================
-- Migration: Add advanced payment fields
-- Date: 2025-12-03
-- Description: Adds fields for payment methods, surcharges, discounts, receipts, and installment plans
-- =====================================================

USE select_dance_db;

-- Add new payment management fields
ALTER TABLE pagos
    ADD COLUMN metodo_pago_realizado ENUM('efectivo', 'transferencia', 'tarjeta', 'mercadopago') DEFAULT NULL 
    COMMENT 'Método de pago utilizado cuando se marca como pagado',
    
    ADD COLUMN recargo_aplicado DECIMAL(10, 2) DEFAULT 0.00 
    COMMENT 'Monto de recargo por mora agregado al pago',
    
    ADD COLUMN descuento_aplicado DECIMAL(10, 2) DEFAULT 0.00 
    COMMENT 'Monto de descuento aplicado (familiar, promoción, etc.)',
    
    ADD COLUMN monto_original DECIMAL(10, 2) DEFAULT NULL 
    COMMENT 'Monto original antes de recargos/descuentos',
    
    ADD COLUMN comprobante_numero VARCHAR(50) DEFAULT NULL UNIQUE 
    COMMENT 'Número único de comprobante de pago',
    
    ADD COLUMN plan_cuotas TINYINT DEFAULT NULL 
    COMMENT 'Total de cuotas si forma parte de un plan de pagos',
    
    ADD COLUMN cuota_numero TINYINT DEFAULT NULL 
    COMMENT 'Número de cuota actual (ej: 1, 2, 3)',
    
    ADD COLUMN plan_pago_id VARCHAR(50) DEFAULT NULL 
    COMMENT 'ID del plan de pago al que pertenece (agrupa cuotas relacionadas)',
    
    ADD COLUMN referencia_externa VARCHAR(100) DEFAULT NULL 
    COMMENT 'ID de transacción de MercadoPago, número de transferencia, etc.',
    
    ADD COLUMN tipo_descuento VARCHAR(50) DEFAULT NULL 
    COMMENT 'Tipo de descuento: familiar, promocion, becado, etc.',
    
    ADD COLUMN notas_pago TEXT DEFAULT NULL 
    COMMENT 'Notas adicionales sobre el pago realizado';

-- Add indices for better performance
ALTER TABLE pagos 
    ADD INDEX idx_metodo_pago_realizado (metodo_pago_realizado),
    ADD INDEX idx_plan_pago (plan_pago_id),
    ADD INDEX idx_comprobante (comprobante_numero);

-- Initialize monto_original for existing records
UPDATE pagos SET monto_original = monto WHERE monto_original IS NULL;

SELECT 'Migration completed successfully - Advanced payment fields added' as Status;
