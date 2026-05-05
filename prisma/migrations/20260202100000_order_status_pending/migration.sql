-- Normalize legacy manual status to the new label used by checkout + admin.
UPDATE "Order" SET status = 'Pending' WHERE status = 'Pending Verification';
