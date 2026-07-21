```markdown
# CLAUDE.md for ecosystem-sim

## Overview

The **ecosystem-sim** is a robust software ecosystem designed to support simulation environments, digital twins, and scenario modeling. It is part of a comprehensive AI-infrastructure estate managed by DCoop HQ, encompassing over 40 interconnected ecosystems. This initiative aims to facilitate realistic modeling and simulation for varied applications ranging from manufacturing and urban planning to disaster management and healthcare.

## Purpose

The primary goals of **ecosystem-sim** are to:

- Create accurate digital representations of physical systems (digital twins) that can be manipulated for analysis and optimization.
- Provide simulation environments that allow users to model complex scenarios and observe potential outcomes.
- Enable scenario modeling tools that facilitate decision-making through predictive analytics.

## Components

### Simulation Environments

- **Core Engine**: A high-performance engine capable of simulating real-time interactions between digital twins and their physical counterparts.
- **User Interface**: An intuitive graphical interface for users to define, manipulate, and visualize simulations.

### Digital Twins

- **Data Ingestion Module**: Capable of interfacing with IoT devices, databases, and other data sources to populate digital twins with real-time data.
- **Update Mechanisms**: Framework for real-time synchronization of digital twins with actual physical systems.

### Scenario Modeling

- **Scenario Creation Tools**: Features that allow users to create, manage, and run various scenarios in a controlled environment.
- **Analytics Dashboard**: A comprehensive dashboard for visualization and analysis of simulation results across different scenarios.

## Architecture

```
ecosystem-sim/
├── src/
│   ├── simulation/
│   ├── digital_twin/
│   └── scenario_modeling/
├── docs/
│   └── user_manual.md
├── tests/
│   ├── simulation_tests/
│   ├── digital_twin_tests/
│   └── scenario_modeling_tests/
├── governance.yaml
└── README.md
```

## Integration

**ecosystem-sim** operates in harmony with other components in the DCoop HQ environment, particularly:

- **Task Broker**: Orchestrates the distribution of tasks related to simulation jobs across available resources.
- **MANGOS Router**: A cost-first router that optimizes resource allocation based on real-time demand and cost considerations.
- **Claude**: The intelligent agent that enhances decision-making processes by leveraging AI capabilities across the ecosystem.

## Governance

The design and operations of **ecosystem-sim** are governed by policies that ensure usability, performance, and compliance. These include version control, update protocols, and access management.

### governance.yaml

```yaml
version: 1.0
ecosystem:
  name: ecosystem-sim
  description: A software ecosystem focused on simulation environments, digital twins, and scenario modeling.
  governance:
    roles:
      - name: Admin
        permissions:
          - full_access
      - name: User
        permissions:
          - create_scenarios
          - run_simulations
          - view_results
    policies:
      version_control:
        enabled: true
        strategy: git-flow
      update_management:
        frequency: monthly
        notification: email
    compliance:
      - data_privacy: GDPR
      - data_integrity: ISO/IEC 27001
```

## Conclusion

The **ecosystem-sim** represents a major advancement in simulation and modeling technology, providing users with powerful tools to create and analyze digital twins and scenarios. As a key part of DCoop HQ's AI-infrastructure, it stands to redefine how simulation environments are leveraged across various industries.
```

## Constellation ROI doctor

```bash
bash constellation/constellation-doctor.sh .
npm run constellation:doctor
```

Host ports (docker-compose): backend **3135**, frontend **3002**. Never commit `.env` or bulk red_team reports.
