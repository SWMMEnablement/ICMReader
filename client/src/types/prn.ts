export interface FileUploadResult {
  fileId: string;
  data: PrnData;
}

export interface PrnData {
  fileInfo: {
    filename: string;
    fileSize: string;
    formatVersion: string;
    simulationDate: string;
  };
  summary: {
    nodeCount: number;
    linkCount: number;
    simulationDuration: string;
    timeStep: string;
  };
  nodeData: NodeData[];
  linkData: LinkData[];
  massBalance: MassBalance;
}

export interface NodeData {
  nodeId: string;
  maxDepth: number;
  maxWaterLevel: number;
  flooding: number;
  status: 'normal' | 'flooding' | 'critical';
}

export interface LinkData {
  linkId: string;
  maxFlow: number;
  maxVelocity: number;
  capacity: number;
  status: 'normal' | 'near-capacity' | 'critical';
}

export interface MassBalance {
  totalRainfall: number;
  dryWeatherFlow: number;
  externalInflow: number;
  totalInflow: number;
  systemOutflow: number;
  flooding: number;
  losses: number;
  totalOutflow: number;
  continuityError: number;
  volumeError: number;
  status: 'acceptable' | 'warning' | 'error';
}

export interface ConversionSettings {
  flowUnits: 'si-to-us' | 'us-to-si' | 'no-conversion';
  lengthUnits: 'm-to-ft' | 'ft-to-m' | 'no-conversion';
  precision: number;
}
