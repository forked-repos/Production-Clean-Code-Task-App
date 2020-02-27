import { IEventBusMaster } from "../MasterEventBus";

export class FakeEventBusMaster implements IEventBusMaster {
    public dispatchedEventsMap: Map<string, any> = new Map();

    
}