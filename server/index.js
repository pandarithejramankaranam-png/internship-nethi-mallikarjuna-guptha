import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_random_secure_secret_key';

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ENDPOINTS ---

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});


// --- CONTRACTS ENDPOINTS ---

// Get All Contracts (with basic filtering/search)
app.get('/api/contracts', authenticateToken, async (req, res) => {
  const { search, status } = req.query;
  let queryText = 'SELECT * FROM contracts';
  const queryParams = [];

  const conditions = [];
  if (status) {
    queryParams.push(status);
    conditions.push(`status = $${queryParams.length}`);
  }
  if (search) {
    queryParams.push(`%${search}%`);
    conditions.push(`(client_name ILIKE $${queryParams.length} OR contact_person ILIKE $${queryParams.length} OR contract_id ILIKE $${queryParams.length})`);
  }

  if (conditions.length > 0) {
    queryText += ' WHERE ' + conditions.join(' AND ');
  }

  queryText += ' ORDER BY contract_id DESC';

  try {
    const result = await pool.query(queryText, queryParams);
    // Map database snake_case back to camelCase expected by the React frontend
    const contracts = result.rows.map(row => ({
      contractId: row.contract_id,
      clientName: row.client_name,
      clientType: row.client_type,
      contactPerson: row.contact_person,
      phoneNumber: row.phone_number,
      email: row.email,
      projectScope: row.project_scope,
      equipmentList: row.equipment_list,
      deliveryDate: row.delivery_date,
      installationDate: row.installation_date,
      contractValue: Number(row.contract_value),
      paymentMilestone: row.payment_milestone,
      supportTerms: row.support_terms,
      status: row.status,
      payments: row.payments
    }));
    res.json(contracts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving contracts' });
  }
});

// Get Single Contract by ID
app.get('/api/contracts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM contracts WHERE contract_id = $1', [id]);
    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({
      contractId: row.contract_id,
      clientName: row.client_name,
      clientType: row.client_type,
      contactPerson: row.contact_person,
      phoneNumber: row.phone_number,
      email: row.email,
      projectScope: row.project_scope,
      equipmentList: row.equipment_list,
      deliveryDate: row.delivery_date,
      installationDate: row.installation_date,
      contractValue: Number(row.contract_value),
      paymentMilestone: row.payment_milestone,
      supportTerms: row.support_terms,
      status: row.status,
      payments: row.payments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving contract' });
  }
});

// Create Contract
app.post('/api/contracts', authenticateToken, async (req, res) => {
  const {
    clientName,
    clientType,
    contactPerson,
    phoneNumber,
    email,
    projectScope,
    equipmentList,
    deliveryDate,
    installationDate,
    contractValue,
    paymentMilestone,
    supportTerms,
    status
  } = req.body;

  try {
    // Generate new contract ID: CON-2026-XXX
    const countResult = await pool.query('SELECT COUNT(*) FROM contracts');
    const count = parseInt(countResult.rows[0].count) + 1;
    const paddedNum = String(count).padStart(3, '0');
    const generatedId = `CON-2026-${paddedNum}`;

    // Construct initial payments object structure
    const totalVal = Number(contractValue);
    const initialPayments = {
      totalAmount: totalVal,
      paidAmount: 0,
      pendingAmount: totalVal,
      dueDate: deliveryDate || new Date().toISOString().split('T')[0],
      paymentStatus: 'Unpaid',
      history: [
        {
          date: deliveryDate || new Date().toISOString().split('T')[0],
          amount: totalVal,
          milestone: paymentMilestone || 'Full Payment (100%)',
          status: 'Pending',
          method: 'ACH Transfer'
        }
      ]
    };

    // If there are detailed percentages in the milestone string, try to parse them
    if (paymentMilestone && paymentMilestone.includes('%')) {
      const parts = paymentMilestone.split(',').map(p => p.trim());
      const history = [];
      let parsedTotal = 0;

      parts.forEach((part, index) => {
        const match = part.match(/(\d+)%/);
        if (match) {
          const pct = parseInt(match[1]);
          const amt = Math.round((totalVal * pct) / 100);
          parsedTotal += amt;
          
          // Adjust last item to handle rounding errors
          const finalAmt = (index === parts.length - 1 && parsedTotal !== totalVal) 
            ? amt + (totalVal - parsedTotal) 
            : amt;

          let targetDate = deliveryDate;
          if (part.toLowerCase().includes('sign') || part.toLowerCase().includes('advance')) {
            targetDate = new Date().toISOString().split('T')[0];
          } else if (part.toLowerCase().includes('install') || part.toLowerCase().includes('handover')) {
            targetDate = installationDate;
          }

          history.push({
            date: targetDate,
            amount: finalAmt,
            milestone: part,
            status: 'Pending',
            method: 'ACH Transfer'
          });
        }
      });

      if (history.length > 0) {
        initialPayments.history = history;
      }
    }

    const queryText = `
      INSERT INTO contracts (
        contract_id, client_name, client_type, contact_person, phone_number, email, 
        project_scope, equipment_list, delivery_date, installation_date, contract_value, 
        payment_milestone, support_terms, status, payments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      generatedId, clientName, clientType, contactPerson, phoneNumber, email,
      projectScope, equipmentList, deliveryDate, installationDate, totalVal,
      paymentMilestone, supportTerms, status || 'Draft', JSON.stringify(initialPayments)
    ];

    const result = await pool.query(queryText, values);
    const row = result.rows[0];

    // Log Activity
    await pool.query(
      'INSERT INTO activities (user_name, action, target, details) VALUES ($1, $2, $3, $4)',
      [req.user.name, 'created contract', generatedId, `Contract for ${clientName} initialized at ₹${totalVal.toLocaleString()}.`]
    );

    res.status(201).json({
      contractId: row.contract_id,
      clientName: row.client_name,
      clientType: row.client_type,
      contactPerson: row.contact_person,
      phoneNumber: row.phone_number,
      email: row.email,
      projectScope: row.project_scope,
      equipmentList: row.equipment_list,
      deliveryDate: row.delivery_date,
      installationDate: row.installation_date,
      contractValue: Number(row.contract_value),
      paymentMilestone: row.payment_milestone,
      supportTerms: row.support_terms,
      status: row.status,
      payments: row.payments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating contract' });
  }
});

// Update Contract
app.put('/api/contracts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    clientName,
    clientType,
    contactPerson,
    phoneNumber,
    email,
    projectScope,
    equipmentList,
    deliveryDate,
    installationDate,
    contractValue,
    paymentMilestone,
    supportTerms,
    status
  } = req.body;

  try {
    // Check if contract exists
    const checkRes = await pool.query('SELECT * FROM contracts WHERE contract_id = $1', [id]);
    const existing = checkRes.rows[0];

    if (!existing) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const totalVal = Number(contractValue);
    
    // Adjust payments values (recompute pending if contract value changed)
    const currentPayments = existing.payments;
    if (currentPayments.totalAmount !== totalVal) {
      currentPayments.totalAmount = totalVal;
      currentPayments.pendingAmount = Math.max(0, totalVal - currentPayments.paidAmount);
      // Adjust last history milestone if simple single-item history
      if (currentPayments.history && currentPayments.history.length === 1) {
        currentPayments.history[0].amount = totalVal;
      }
    }

    const queryText = `
      UPDATE contracts 
      SET client_name = $1, client_type = $2, contact_person = $3, phone_number = $4, email = $5,
          project_scope = $6, equipment_list = $7, delivery_date = $8, installation_date = $9, 
          contract_value = $10, payment_milestone = $11, support_terms = $12, status = $13, payments = $14,
          updated_at = CURRENT_TIMESTAMP
      WHERE contract_id = $15
      RETURNING *
    `;

    const values = [
      clientName, clientType, contactPerson, phoneNumber, email,
      projectScope, equipmentList, deliveryDate, installationDate, totalVal,
      paymentMilestone, supportTerms, status, JSON.stringify(currentPayments), id
    ];

    const result = await pool.query(queryText, values);
    const row = result.rows[0];

    // Log Activity
    await pool.query(
      'INSERT INTO activities (user_name, action, target, details) VALUES ($1, $2, $3, $4)',
      [req.user.name, 'updated contract', id, `Contract details for ${clientName} were updated.`]
    );

    res.json({
      contractId: row.contract_id,
      clientName: row.client_name,
      clientType: row.client_type,
      contactPerson: row.contact_person,
      phoneNumber: row.phone_number,
      email: row.email,
      projectScope: row.project_scope,
      equipmentList: row.equipment_list,
      deliveryDate: row.delivery_date,
      installationDate: row.installation_date,
      contractValue: Number(row.contract_value),
      paymentMilestone: row.payment_milestone,
      supportTerms: row.support_terms,
      status: row.status,
      payments: row.payments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating contract' });
  }
});

// Delete Contract
app.delete('/api/contracts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const checkRes = await pool.query('SELECT client_name FROM contracts WHERE contract_id = $1', [id]);
    const contract = checkRes.rows[0];

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    await pool.query('DELETE FROM contracts WHERE contract_id = $1', [id]);

    // Log Activity
    await pool.query(
      'INSERT INTO activities (user_name, action, target, details) VALUES ($1, $2, $3, $4)',
      [req.user.name, 'deleted contract', id, `Contract for ${contract.client_name} was deleted.`]
    );

    res.json({ message: 'Contract successfully deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting contract' });
  }
});


// --- PAYMENTS & MILESTONES ENDPOINTS ---

// Get All Payments (Milestones)
app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT contract_id, client_name, client_type, payments FROM contracts');
    const allMilestones = [];

    result.rows.forEach(row => {
      const paymentsObj = row.payments;
      if (paymentsObj && paymentsObj.history) {
        paymentsObj.history.forEach((payment, idx) => {
          allMilestones.push({
            contractId: row.contract_id,
            clientName: row.client_name,
            clientType: row.client_type,
            milestoneIndex: idx,
            date: payment.date,
            amount: Number(payment.amount),
            milestone: payment.milestone,
            status: payment.status,
            method: payment.method
          });
        });
      }
    });

    res.json(allMilestones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving payments' });
  }
});

// Record Milestone Payment (PUT)
app.put('/api/contracts/:contractId/payments/:milestoneIndex/record', authenticateToken, async (req, res) => {
  const { contractId, milestoneIndex } = req.params;
  const idx = parseInt(milestoneIndex);

  try {
    const result = await pool.query('SELECT * FROM contracts WHERE contract_id = $1', [contractId]);
    const contract = result.rows[0];

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const paymentsObj = contract.payments;
    if (!paymentsObj || !paymentsObj.history || !paymentsObj.history[idx]) {
      return res.status(404).json({ error: 'Milestone index not found' });
    }

    const milestone = paymentsObj.history[idx];
    if (milestone.status === 'Paid') {
      return res.status(400).json({ error: 'Milestone is already marked as Paid' });
    }

    // Update milestone status
    milestone.status = 'Paid';
    paymentsObj.paidAmount = Number(paymentsObj.paidAmount) + Number(milestone.amount);
    paymentsObj.pendingAmount = Math.max(0, Number(paymentsObj.totalAmount) - paymentsObj.paidAmount);
    paymentsObj.paymentStatus = paymentsObj.pendingAmount === 0 ? 'Paid' : 'Partially Paid';

    paymentsObj.history[idx] = milestone;

    // Update contract in database
    await pool.query(
      'UPDATE contracts SET payments = $1, updated_at = CURRENT_TIMESTAMP WHERE contract_id = $2',
      [JSON.stringify(paymentsObj), contractId]
    );

    // Log Activity
    await pool.query(
      'INSERT INTO activities (user_name, action, target, details) VALUES ($1, $2, $3, $4)',
      [
        req.user.name, 
        'recorded payment', 
        contractId, 
        `Received payment of ₹${milestone.amount.toLocaleString()} for milestone: "${milestone.milestone}".`
      ]
    );

    res.json({ success: true, payments: paymentsObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error recording payment milestone' });
  }
});


// --- DASHBOARD ENDPOINTS ---

// Dashboard Summary Stats
app.get('/api/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    const totalContractsRes = await pool.query('SELECT COUNT(*) FROM contracts');
    const totalContracts = parseInt(totalContractsRes.rows[0].count);

    const activeContractsRes = await pool.query(
      "SELECT COUNT(*) FROM contracts WHERE status = 'In Progress' OR status = 'Approved'"
    );
    const activeContracts = parseInt(activeContractsRes.rows[0].count);

    const completedProjectsRes = await pool.query(
      "SELECT COUNT(*) FROM contracts WHERE status = 'Completed'"
    );
    const completedProjects = parseInt(completedProjectsRes.rows[0].count);

    // Compute sums using JSONB operators
    const totalsRes = await pool.query(`
      SELECT 
        SUM(contract_value) as total_value,
        SUM((payments->>'pendingAmount')::numeric) as total_pending
      FROM contracts
    `);

    const totalValue = Number(totalsRes.rows[0].total_value || 0);
    const totalPendingPayments = Number(totalsRes.rows[0].total_pending || 0);

    const recentContractsRes = await pool.query(
      'SELECT * FROM contracts ORDER BY contract_id DESC LIMIT 5'
    );

    const recentContracts = recentContractsRes.rows.map(row => ({
      contractId: row.contract_id,
      clientName: row.client_name,
      clientType: row.client_type,
      contactPerson: row.contact_person,
      phoneNumber: row.phone_number,
      email: row.email,
      projectScope: row.project_scope,
      equipmentList: row.equipment_list,
      deliveryDate: row.delivery_date,
      installationDate: row.installation_date,
      contractValue: Number(row.contract_value),
      paymentMilestone: row.payment_milestone,
      supportTerms: row.support_terms,
      status: row.status,
      payments: row.payments
    }));

    res.json({
      totalContracts,
      activeContracts,
      completedProjects,
      totalPendingPayments,
      totalValue,
      recentContracts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving dashboard summary' });
  }
});

// Dashboard Audit logs (GET)
app.get('/api/dashboard/activities', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 15');
    const activities = result.rows.map(row => ({
      id: `act-${row.id}`,
      user: row.user_name,
      action: row.action,
      target: row.target,
      timestamp: row.timestamp.toISOString(),
      details: row.details
    }));
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving activities' });
  }
});

// Create Audit Log (POST)
app.post('/api/dashboard/activities', authenticateToken, async (req, res) => {
  const { user, action, target, details } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO activities (user_name, action, target, details) VALUES ($1, $2, $3, $4) RETURNING *',
      [user || req.user.name, action, target, details]
    );
    const row = result.rows[0];

    res.status(201).json({
      id: `act-${row.id}`,
      user: row.user_name,
      action: row.action,
      target: row.target,
      timestamp: row.timestamp.toISOString(),
      details: row.details
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error logging activity' });
  }
});


// --- REPORTS ENDPOINTS ---

// Status Stats
app.get('/api/reports/status', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT status, COUNT(*) as count FROM contracts GROUP BY status');
    const stats = {};
    result.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
    });
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error generating status report' });
  }
});

// Revenue Stats
app.get('/api/reports/revenue', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT client_type, SUM(contract_value) as value FROM contracts GROUP BY client_type');
    const stats = {};
    result.rows.forEach(row => {
      stats[row.client_type || 'Corporate'] = Number(row.value);
    });
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error generating revenue report' });
  }
});


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
