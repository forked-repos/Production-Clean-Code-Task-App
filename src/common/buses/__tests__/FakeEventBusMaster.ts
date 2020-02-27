import { IEventBusMaster } from "../MasterEventBus";

export class FakeEventBusMaster {
    public dispatchedEventsMap: Map<string, any> = new Map();

    
}