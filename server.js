const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir frontend compilado (para producción)
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// --- Endpoints ---

// 1. USUARIOS
app.get('/api/usuarios', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

app.post('/api/usuarios', async (req, res) => {
    const { nombre, email, telefono } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO usuarios (nombre, email, telefono, presupuesto_mensual) VALUES ($1, $2, $3, 0) RETURNING *',
            [nombre, email, telefono]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

app.put('/api/usuarios/:id_usuario/presupuesto', async (req, res) => {
    const { id_usuario } = req.params;
    const { presupuesto_mensual } = req.body;
    try {
        const result = await db.query(
            'UPDATE usuarios SET presupuesto_mensual = $1 WHERE id_usuario = $2 RETURNING *',
            [presupuesto_mensual, id_usuario]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar presupuesto' });
    }
});

// 2. TARJETAS
app.get('/api/tarjetas/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const result = await db.query('SELECT * FROM tarjetas WHERE id_usuario = $1', [id_usuario]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener tarjetas' });
    }
});

app.post('/api/tarjetas', async (req, res) => {
    const { id_usuario, banco, tipo, alias, ultimos_digitos, limite_credito, tasa_interes_mensual, fecha_corte, fecha_pago } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO tarjetas (id_usuario, banco, tipo, alias, ultimos_digitos, limite_credito, tasa_interes_mensual, fecha_corte, fecha_pago) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [id_usuario, banco, tipo, alias, ultimos_digitos, limite_credito, tasa_interes_mensual, fecha_corte, fecha_pago]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear tarjeta' });
    }
});

app.put('/api/tarjetas/:id_tarjeta', async (req, res) => {
    const { id_tarjeta } = req.params;
    const { banco, tipo, alias, ultimos_digitos, limite_credito, tasa_interes_mensual, fecha_corte, fecha_pago } = req.body;
    try {
        const result = await db.query(
            `UPDATE tarjetas SET banco=$1, tipo=$2, alias=$3, ultimos_digitos=$4, limite_credito=$5, tasa_interes_mensual=$6, fecha_corte=$7, fecha_pago=$8 WHERE id_tarjeta=$9 RETURNING *`,
            [banco, tipo, alias, ultimos_digitos, limite_credito, tasa_interes_mensual, fecha_corte, fecha_pago, id_tarjeta]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Tarjeta no encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar tarjeta' });
    }
});

app.delete('/api/tarjetas/:id_tarjeta', async (req, res) => {
    const { id_tarjeta } = req.params;
    try {
        const result = await db.query('DELETE FROM tarjetas WHERE id_tarjeta = $1 RETURNING *', [id_tarjeta]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Tarjeta no encontrada' });
        res.json({ mensaje: 'Tarjeta eliminada', tarjeta: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar tarjeta' });
    }
});

// 3. COMPRAS
app.get('/api/compras/:id_tarjeta', async (req, res) => {
    const { id_tarjeta } = req.params;
    try {
        const result = await db.query('SELECT * FROM compras WHERE id_tarjeta = $1 ORDER BY fecha DESC', [id_tarjeta]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener compras' });
    }
});

app.post('/api/compras', async (req, res) => {
    const { id_tarjeta, descripcion, monto, categoria, fecha, es_msi, meses_msi } = req.body;
    const fechaCompra = fecha || new Date();
    const cat = categoria || 'Otro';
    try {
        const result = await db.query(
            `INSERT INTO compras (id_tarjeta, descripcion, monto, categoria, fecha, es_msi, meses_msi) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id_tarjeta, descripcion, monto, cat, fechaCompra, es_msi, meses_msi]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear compra' });
    }
});

app.put('/api/compras/:id_compra', async (req, res) => {
    const { id_compra } = req.params;
    const { descripcion, monto, categoria, fecha, es_msi, meses_msi } = req.body;
    try {
        const result = await db.query(
            `UPDATE compras SET descripcion=$1, monto=$2, categoria=$3, fecha=$4, es_msi=$5, meses_msi=$6 WHERE id_compra=$7 RETURNING *`,
            [descripcion, monto, categoria, fecha, es_msi, meses_msi, id_compra]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Compra no encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar compra' });
    }
});

app.delete('/api/compras/:id_compra', async (req, res) => {
    const { id_compra } = req.params;
    try {
        const result = await db.query('DELETE FROM compras WHERE id_compra = $1 RETURNING *', [id_compra]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Compra no encontrada' });
        res.json({ mensaje: 'Compra eliminada', compra: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar compra' });
    }
});

// 4. PAGOS
app.get('/api/pagos/:id_tarjeta', async (req, res) => {
    const { id_tarjeta } = req.params;
    try {
        const result = await db.query('SELECT * FROM pagos WHERE id_tarjeta = $1 ORDER BY fecha DESC', [id_tarjeta]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
});

app.post('/api/pagos', async (req, res) => {
    const { id_tarjeta, tipo_pago, monto, metodo, notas, fecha } = req.body;
    const fechaPago = fecha || new Date();

    try {
        // 1. Verificar tarjeta y obtener usuario con presupuesto
        const tarjetaRes = await db.query('SELECT * FROM tarjetas WHERE id_tarjeta = $1', [id_tarjeta]);
        if (tarjetaRes.rows.length === 0) return res.status(404).json({ error: 'Tarjeta no encontrada' });
        const tarjeta = tarjetaRes.rows[0];

        const usuarioRes = await db.query('SELECT presupuesto_mensual FROM usuarios WHERE id_usuario = $1', [tarjeta.id_usuario]);
        const presupuesto = parseFloat(usuarioRes.rows[0]?.presupuesto_mensual || 0);

        // 2. Calcular Saldo Disponible (Cash Flow)
        // Egresos Directos (Compras con Débito)
        const debitoRes = await db.query('SELECT id_tarjeta FROM tarjetas WHERE id_usuario = $1 AND tipo = $2', [tarjeta.id_usuario, 'débito']);
        const debitoCardIds = debitoRes.rows.map(r => r.id_tarjeta);

        let totalDebitPurchases = 0;
        if (debitoCardIds.length > 0) {
            const debitPurchasesRes = await db.query('SELECT SUM(monto) as total FROM compras WHERE id_tarjeta = ANY($1::int[])', [debitoCardIds]);
            totalDebitPurchases = parseFloat(debitPurchasesRes.rows[0].total || 0);
        }

        // Pagos ya realizados
        const pagosRes = await db.query(`
            SELECT SUM(p.monto) as total 
            FROM pagos p 
            JOIN tarjetas t ON p.id_tarjeta = t.id_tarjeta 
            WHERE t.id_usuario = $1`,
            [tarjeta.id_usuario]
        );
        const totalPagos = parseFloat(pagosRes.rows[0].total || 0);

        const saldoDisponible = presupuesto - totalDebitPurchases - totalPagos;
        const montoPagar = parseFloat(monto);

        if (montoPagar > saldoDisponible) {
            return res.status(400).json({
                error: 'Fondos insuficientes',
                detalle: `Saldo disponible: ${saldoDisponible.toFixed(2)}. Intentas pagar: ${montoPagar.toFixed(2)}.`
            });
        }

        const result = await db.query(
            `INSERT INTO pagos (id_tarjeta, tipo_pago, monto, metodo, notas, fecha) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id_tarjeta, tipo_pago, monto, metodo, notas, fechaPago]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al registrar pago' });
    }
});

app.put('/api/pagos/:id_pago', async (req, res) => {
    const { id_pago } = req.params;
    const { tipo_pago, monto, metodo, notas, fecha } = req.body;
    try {
        const result = await db.query(
            `UPDATE pagos SET tipo_pago=$1, monto=$2, metodo=$3, notas=$4, fecha=$5 WHERE id_pago=$6 RETURNING *`,
            [tipo_pago, monto, metodo, notas, fecha, id_pago]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pago no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar pago' });
    }
});

app.delete('/api/pagos/:id_pago', async (req, res) => {
    const { id_pago } = req.params;
    try {
        const result = await db.query('DELETE FROM pagos WHERE id_pago = $1 RETURNING *', [id_pago]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pago no encontrado' });
        res.json({ mensaje: 'Pago eliminado', pago: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar pago' });
    }
});

// 5. INGRESOS
app.get('/api/ingresos/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const result = await db.query('SELECT * FROM ingresos WHERE id_usuario = $1 ORDER BY fecha DESC', [id_usuario]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener ingresos' });
    }
});

app.post('/api/ingresos', async (req, res) => {
    const { id_usuario, fuente, monto, fecha } = req.body;
    const fechaIngreso = fecha || new Date();
    try {
        const result = await db.query(
            `INSERT INTO ingresos (id_usuario, fuente, monto, fecha) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [id_usuario, fuente, monto, fechaIngreso]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al registrar ingreso' });
    }
});

app.put('/api/ingresos/:id_ingreso', async (req, res) => {
    const { id_ingreso } = req.params;
    const { fuente, monto, fecha } = req.body;
    try {
        const result = await db.query(
            `UPDATE ingresos SET fuente=$1, monto=$2, fecha=$3 WHERE id_ingreso=$4 RETURNING *`,
            [fuente, monto, fecha, id_ingreso]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Ingreso no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar ingreso' });
    }
});

app.delete('/api/ingresos/:id_ingreso', async (req, res) => {
    const { id_ingreso } = req.params;
    try {
        const result = await db.query('DELETE FROM ingresos WHERE id_ingreso = $1 RETURNING *', [id_ingreso]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Ingreso no encontrado' });
        res.json({ mensaje: 'Ingreso eliminado', ingreso: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar ingreso' });
    }
});

// 7. SIMULADOR DE INTERESES (Sin DB)
app.post('/api/simular-intereses', (req, res) => {
    const { monto_compra, tasa_anual } = req.body;
    if (!monto_compra || !tasa_anual) {
        return res.status(400).json({ error: 'Faltan datos' });
    }
    const tasaMensual = (tasa_anual / 100) / 12;
    const interesMensual = monto_compra * tasaMensual;

    res.json({
        interes_mensual_estimado: interesMensual.toFixed(2),
        tasa_mensual_aplicada: (tasaMensual * 100).toFixed(2) + '%',
        mensaje: "Recuerda que el interés compuesto crece rápido.",
        color: "amarillo"
    });
});

// 8. PING
app.get('/api/ping', (req, res) => {
    res.json({ mensaje: 'API funcionando correctamente' });
});

// 9. ANALISIS FINANCIERO (Complejo)
app.get('/api/analisis-financiero/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        // 1. Obtener usuario con presupuesto
        const userResult = await db.query('SELECT nombre, presupuesto_mensual FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        const usuarioNombre = userResult.rows[0].nombre;
        const presupuestoMensual = parseFloat(userResult.rows[0].presupuesto_mensual || 0);

        // 2. Obtener tarjetas y calcular deuda
        const tarjetasResult = await db.query('SELECT * FROM tarjetas WHERE id_usuario = $1', [id_usuario]);
        const tarjetas = tarjetasResult.rows;

        let analyzedCards = [];
        let totalDebt = 0;
        let totalAvailable = 0;
        let allCardIds = [];

        for (let card of tarjetas) {
            allCardIds.push(card.id_tarjeta);
            if (card.tipo === 'débito') {
                analyzedCards.push({ ...card, deuda: 0, disponible: 0, porcentaje_utilizado: 0, estado: 'verde' });
                continue;
            }

            // Calcular deuda (Suma de compras - Suma de pagos) - Simplificado
            // Nota: En un sistema real esto es mucho más complejo por fechas de corte
            const comprasRes = await db.query('SELECT SUM(monto) as total FROM compras WHERE id_tarjeta = $1', [card.id_tarjeta]);
            const pagosRes = await db.query('SELECT SUM(monto) as total FROM pagos WHERE id_tarjeta = $1', [card.id_tarjeta]);

            const comprasTotal = parseFloat(comprasRes.rows[0].total || 0);
            const pagosTotal = parseFloat(pagosRes.rows[0].total || 0);

            // Asumimos que la deuda es compras - pagos (si es negativo, es saldo a favor, lo ponemos en 0 deuda)
            let currentDebt = comprasTotal - pagosTotal;
            if (currentDebt < 0) currentDebt = 0; // Saldo a favor no es deuda

            const limit = parseFloat(card.limite_credito);
            const available = limit - currentDebt;
            const utilization = limit > 0 ? (currentDebt / limit) * 100 : 0;

            let status = 'verde';
            if (utilization > 70) status = 'rojo';
            else if (utilization > 30) status = 'amarillo';

            analyzedCards.push({
                ...card,
                deuda: currentDebt,
                disponible: available,
                porcentaje_utilizado: parseFloat(utilization.toFixed(2)),
                estado: status
            });

            totalDebt += currentDebt;
            totalAvailable += available;
        }

        // 3. Gastos por categoría
        let gastosPorCategoria = [];
        let totalSpending = 0;
        if (allCardIds.length > 0) {
            const catResult = await db.query(
                `SELECT categoria, SUM(monto) as total FROM compras WHERE id_tarjeta = ANY($1::int[]) GROUP BY categoria`,
                [allCardIds]
            );

            totalSpending = catResult.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);

            const categoryColors = {
                'Comida': '#10B981', 'Transporte': '#3B82F6', 'Entretenimiento': '#8B5CF6',
                'Servicios': '#F59E0B', 'Compras': '#EC4899', 'Salud': '#EF4444', 'Otro': '#6B7280'
            };

            gastosPorCategoria = catResult.rows.map(row => ({
                name: row.categoria,
                value: parseFloat(row.total),
                porcentaje: totalSpending > 0 ? parseFloat(((row.total / totalSpending) * 100).toFixed(1)) : 0,
                color: categoryColors[row.categoria] || '#6B7280'
            }));
        }

        // 4. Saldo Disponible (based on presupuesto_mensual)
        // Compras con débito
        let totalDebitPurchases = 0;
        const debitoRes = await db.query('SELECT id_tarjeta FROM tarjetas WHERE id_usuario = $1 AND tipo = $2', [id_usuario, 'débito']);
        const debitoCardIds = debitoRes.rows.map(r => r.id_tarjeta);
        if (debitoCardIds.length > 0) {
            const debRes = await db.query('SELECT SUM(monto) as total FROM compras WHERE id_tarjeta = ANY($1::int[])', [debitoCardIds]);
            totalDebitPurchases = parseFloat(debRes.rows[0].total || 0);
        }

        // Pagos a tarjetas de crédito
        const pagosResAll = await db.query(`
            SELECT SUM(p.monto) as total 
            FROM pagos p 
            JOIN tarjetas t ON p.id_tarjeta = t.id_tarjeta 
            WHERE t.id_usuario = $1`, [id_usuario]);
        const totalPagosAll = parseFloat(pagosResAll.rows[0].total || 0);

        // Saldo Disponible = Presupuesto - Gastos Débito - Pagos Crédito
        const saldoDisponible = presupuestoMensual - totalDebitPurchases - totalPagosAll;

        // 5. Recomendaciones
        const recommendations = [];
        if (totalDebt === 0) recommendations.push("🌟 ¡Felicidades! No tienes deudas registradas.");
        else if (totalDebt > (presupuestoMensual * 0.4)) recommendations.push("⚠️ Tu deuda supera el 40% de tu presupuesto. Modera gastos.");

        analyzedCards.forEach(c => {
            if (c.estado === 'rojo') recommendations.push(`🚨 La tarjeta ${c.alias} está al límite (${c.porcentaje_utilizado}%). Paga de inmediato.`);
            if (c.estado === 'amarillo') recommendations.push(`👀 Vigila la tarjeta ${c.alias}, estás usando más del 30%.`);
        });

        if (saldoDisponible > 0) recommendations.push("💰 Tienes saldo disponible.");
        else recommendations.push("📉 Has gastado todo tu presupuesto.");

        res.json({
            usuario: usuarioNombre,
            deuda_total: totalDebt,
            disponible_total: totalAvailable,
            interes_estimado_mensual: totalDebt * 0.025,
            tarjetas: analyzedCards,
            gastos_por_categoria: gastosPorCategoria,
            ingresos_mes: presupuestoMensual,
            gastos_mes: totalSpending,
            saldo_neto: saldoDisponible,
            recomendaciones: recommendations
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en análisis financiero' });
    }
});

// Catch-all para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
