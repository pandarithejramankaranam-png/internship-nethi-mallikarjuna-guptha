export const initialContracts = [
  {
    contractId: "CON-2026-001",
    clientName: "Vertex Heights HOA",
    clientType: "Apartment",
    contactPerson: "Marcus Aurelius",
    phoneNumber: "+1 (555) 123-4567",
    email: "marcus@vertexheights.com",
    projectScope: "Complete rooftop gym and community club room fitness center setup. Installation of heavy-duty flooring and sound insulation.",
    equipmentList: "5x Premium Treadmills, 3x Recumbent Bikes, 4x Dual-Adjustable Pulleys, 1x Leg Press, Dumbbell Rack (5-50 lbs with bench)",
    deliveryDate: "2026-07-10",
    installationDate: "2026-07-15",
    contractValue: 85000,
    paymentMilestone: "40% Advance, 40% Delivery, 20% Sign-off",
    supportTerms: "3 Years Preventive Maintenance, Annual Safety Inspections",
    status: "In Progress",
    payments: {
      totalAmount: 85000,
      paidAmount: 34000,
      pendingAmount: 51000,
      dueDate: "2026-07-10",
      paymentStatus: "Partially Paid",
      history: [
        {
          date: "2026-06-01",
          amount: 34000,
          milestone: "Advance Payment (40%)",
          status: "Paid",
          method: "ACH Transfer"
        },
        {
          date: "2026-07-10",
          amount: 34000,
          milestone: "Delivery Milestone (40%)",
          status: "Pending",
          method: "ACH Transfer"
        },
        {
          date: "2026-07-15",
          amount: 17000,
          milestone: "Final Handover (20%)",
          status: "Pending",
          method: "ACH Transfer"
        }
      ]
    }
  },
  {
    contractId: "CON-2026-002",
    clientName: "Grand Hyatt Wellness Club",
    clientType: "Hotel",
    contactPerson: "Sarah Jenkins",
    phoneNumber: "+1 (555) 987-6543",
    email: "s.jenkins@hyattwellness.com",
    projectScope: "Luxury guest gym refresh including cardio zone layout design, flooring, and screen-integrated cardio gear.",
    equipmentList: "8x Premium Treadmills with Smart Consoles, 4x Elliptical Trainers, 1x Multi-Gym Selectorized Tower, Kettlebell Sets, Yoga Mats and Wall Racks",
    deliveryDate: "2026-05-12",
    installationDate: "2026-05-18",
    contractValue: 120000,
    paymentMilestone: "50% Advance, 50% Installation Signoff",
    supportTerms: "5 Years Parts & Motor Warranty, Bi-Annual PM Visits",
    status: "Completed",
    payments: {
      totalAmount: 120000,
      paidAmount: 120000,
      pendingAmount: 0,
      dueDate: "2026-05-18",
      paymentStatus: "Paid",
      history: [
        {
          date: "2026-04-10",
          amount: 60000,
          milestone: "Advance Deposit (50%)",
          status: "Paid",
          method: "Wire Transfer"
        },
        {
          date: "2026-05-20",
          amount: 60000,
          milestone: "Installation Handover (50%)",
          status: "Paid",
          method: "Wire Transfer"
        }
      ]
    }
  },
  {
    contractId: "CON-2026-003",
    clientName: "Innovate Tech HQ",
    clientType: "Corporate",
    contactPerson: "David Chen",
    phoneNumber: "+1 (555) 456-7890",
    email: "dchen@innovatetech.com",
    projectScope: "State of the art corporate wellness center build-out. Features cross-fit zone and group cycling studio setup.",
    equipmentList: "12x Group Spin Bikes, 6x Water Rowers, Custom double-sided Power Racks, 3x Olympic Barbell Sets, 4x Multi-jungles, Recovery Room Massage chairs",
    deliveryDate: "2026-08-01",
    installationDate: "2026-08-08",
    contractValue: 210000,
    paymentMilestone: "30% Advance, 40% Delivery, 30% Handover",
    supportTerms: "2 Years Full Warranty, 24/7 Priority Support Callouts",
    status: "Approved",
    payments: {
      totalAmount: 210000,
      paidAmount: 63000,
      pendingAmount: 147000,
      dueDate: "2026-08-01",
      paymentStatus: "Partially Paid",
      history: [
        {
          date: "2026-06-10",
          amount: 63000,
          milestone: "Sign-on Deposit (30%)",
          status: "Paid",
          method: "ACH Transfer"
        },
        {
          date: "2026-08-01",
          amount: 84000,
          milestone: "Delivery Milestone (40%)",
          status: "Pending",
          method: "ACH Transfer"
        },
        {
          date: "2026-08-08",
          amount: 63000,
          milestone: "Handover & Training (30%)",
          status: "Pending",
          method: "ACH Transfer"
        }
      ]
    }
  },
  {
    contractId: "CON-2026-004",
    clientName: "Ocean Edge Luxury Residences",
    clientType: "Apartment",
    contactPerson: "Elena Rostova",
    phoneNumber: "+1 (555) 789-0123",
    email: "erostova@oceanedge.org",
    projectScope: "Modern high-intensity interval training (HIIT) setup in auxiliary fitness room.",
    equipmentList: "6x Curved Manual Treadmills, 4x Air Assault Bikes, 2x Concept2 SkiErgs, Heavy Med Balls",
    deliveryDate: "2026-09-15",
    installationDate: "2026-09-16",
    contractValue: 45000,
    paymentMilestone: "100% Pre-delivery",
    supportTerms: "1 Year Parts Warranty, Standard Phone Support",
    status: "Draft",
    payments: {
      totalAmount: 45000,
      paidAmount: 0,
      pendingAmount: 45000,
      dueDate: "2026-09-01",
      paymentStatus: "Unpaid",
      history: [
        {
          date: "2026-09-01",
          amount: 45000,
          milestone: "Full Advance Payment (100%)",
          status: "Pending",
          method: "Credit Card"
        }
      ]
    }
  },
  {
    contractId: "CON-2026-005",
    clientName: "Ritz-Carlton Downtown Gym",
    clientType: "Hotel",
    contactPerson: "Jonathan Vance",
    phoneNumber: "+1 (555) 345-6789",
    email: "j.vance@ritz-downtown.com",
    projectScope: "Boutique Reformer Pilates and yoga studio wing extension.",
    equipmentList: "4x Premium Pilates Reformer Beds, 1x Cadillac Table, Balanced Body Mats, Studio Surround Sound System",
    deliveryDate: "2026-06-25",
    installationDate: "2026-06-28",
    contractValue: 95000,
    paymentMilestone: "50% Advance, 50% Installation Signoff",
    supportTerms: "4 Years Premium Warranty, Quarterly Sound & Rig Inspections",
    status: "Approved",
    payments: {
      totalAmount: 95000,
      paidAmount: 47500,
      pendingAmount: 47500,
      dueDate: "2026-06-25",
      paymentStatus: "Partially Paid",
      history: [
        {
          date: "2026-05-15",
          amount: 47500,
          milestone: "Advance Deposit (50%)",
          status: "Paid",
          method: "Wire Transfer"
        },
        {
          date: "2026-06-25",
          amount: 47500,
          milestone: "Installation Completion (50%)",
          status: "Pending",
          method: "Wire Transfer"
        }
      ]
    }
  }
];

export const initialActivities = [
  {
    id: "act-1",
    user: "Admin Team",
    action: "created contract",
    target: "CON-2026-005",
    timestamp: "2026-06-15T09:30:00Z",
    details: "Ritz-Carlton Downtown Gym contract initialized at ₹95,000."
  },
  {
    id: "act-2",
    user: "Finance Dept",
    action: "verified payment",
    target: "CON-2026-003",
    timestamp: "2026-06-14T14:45:00Z",
    details: "Advance Deposit (₹63,000) for Innovate Tech HQ processed."
  },
  {
    id: "act-3",
    user: "Logistics Lead",
    action: "completed delivery",
    target: "CON-2026-002",
    timestamp: "2026-05-12T11:00:00Z",
    details: "All equipment delivered and accounted for at Grand Hyatt."
  },
  {
    id: "act-4",
    user: "Project Manager",
    action: "updated status",
    target: "CON-2026-001",
    timestamp: "2026-06-12T16:20:00Z",
    details: "Vertex Heights HOA marked 'In Progress' - Flooring prep started."
  },
  {
    id: "act-5",
    user: "Client Relations",
    action: "renewed warranty terms",
    target: "CON-2026-002",
    timestamp: "2026-06-10T10:00:00Z",
    details: "Extended parts warranty on Grand Hyatt treadmills from 3 to 5 years."
  }
];
