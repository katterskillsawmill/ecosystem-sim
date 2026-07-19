use specs::prelude::*;
use serde::{Deserialize, Serialize};

/// Universal Components for any simulation domain
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PhysicalState {
    pub x: f32,
    pub y: f32,
    pub velocity_x: f32,
    pub velocity_y: f32,
}
impl Component for PhysicalState {
    type Storage = VecStorage<Self>;
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkloadCapacity {
    pub current_load: f32,
    pub max_load: f32,
    pub processing_rate: f32,
}
impl Component for WorkloadCapacity {
    type Storage = VecStorage<Self>;
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgentIdentity {
    pub name: String,
    pub domain_role: String,
}
impl Component for AgentIdentity {
    type Storage = VecStorage<Self>;
}

/// The Universal Physics & Processing System
pub struct UniversalTickSystem;

impl<'a> System<'a> for UniversalTickSystem {
    type SystemData = (
        WriteStorage<'a, PhysicalState>,
        WriteStorage<'a, WorkloadCapacity>,
    );

    fn run(&mut self, (mut physical_states, mut workloads): Self::SystemData) {
        // 1. Process Spatial Movement
        for state in (&mut physical_states).join() {
            state.x += state.velocity_x;
            state.y += state.velocity_y;
        }

        // 2. Process Universal Workloads
        for workload in (&mut workloads).join() {
            if workload.current_load > 0.0 {
                workload.current_load -= workload.processing_rate;
                if workload.current_load < 0.0 {
                    workload.current_load = 0.0;
                }
            }
        }
    }
}

/// Simulation Engine Wrapper
pub struct Engine {
    pub world: World,
    pub dispatcher: Dispatcher<'static, 'static>,
}

impl Engine {
    pub fn new() -> Self {
        let mut world = World::new();
        
        // Register Universal Components
        world.register::<PhysicalState>();
        world.register::<WorkloadCapacity>();
        world.register::<AgentIdentity>();

        let dispatcher = DispatcherBuilder::new()
            .with(UniversalTickSystem, "tick_system", &[])
            .build();

        Self { world, dispatcher }
    }

    pub fn tick(&mut self) {
        self.dispatcher.dispatch(&mut self.world);
        self.world.maintain();
    }
}
