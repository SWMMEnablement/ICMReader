import { useState } from 'react';
import { Download, FileText, Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PrnData, ConversionSettings } from '@/types/prn';
import { formatNumber, getStatusColor } from '@/lib/utils';

interface ResultsDisplayProps {
  data: PrnData | null;
  fileId?: string;
  settings: ConversionSettings;
  onExport: (format: 'csv' | 'pdf') => void;
}

export function ResultsDisplay({ data, fileId, settings, onExport }: ResultsDisplayProps) {
  const [nodeFilter, setNodeFilter] = useState('');
  const [linkFilter, setLinkFilter] = useState('');
  const [nodePage, setNodePage] = useState(0);
  const [linkPage, setLinkPage] = useState(0);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const pageSize = 25;

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">Upload a PRN file to view analysis results</p>
      </div>
    );
  }

  const filteredNodeData = data.nodeData.filter(node =>
    node.nodeId.toLowerCase().includes(nodeFilter.toLowerCase())
  );

  const filteredLinkData = data.linkData.filter(link =>
    link.linkId.toLowerCase().includes(linkFilter.toLowerCase())
  );

  const paginatedNodeData = filteredNodeData.slice(
    nodePage * pageSize,
    (nodePage + 1) * pageSize
  );

  const paginatedLinkData = filteredLinkData.slice(
    linkPage * pageSize,
    (linkPage + 1) * pageSize
  );

  const getFlowUnit = () => {
    if (settings.flowUnits === 'si-to-us') return 'cfs';
    if (settings.flowUnits === 'us-to-si') return 'm³/s';
    return 'm³/s';
  };

  const getLengthUnit = () => {
    if (settings.lengthUnits === 'm-to-ft') return 'ft';
    if (settings.lengthUnits === 'ft-to-m') return 'm';
    return 'm';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <Tabs defaultValue="overview" className="w-full">
        <div className="border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
            <TabsTrigger
              value="overview"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="nodes"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4"
            >
              Node Data
            </TabsTrigger>
            <TabsTrigger
              value="links"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4"
            >
              Link Data
            </TabsTrigger>
            <TabsTrigger
              value="mass-balance"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4"
            >
              Mass Balance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">File Information</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-600">File Name:</dt>
                  <dd className="text-xs font-medium text-gray-900">{data.fileInfo.filename}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-600">File Size:</dt>
                  <dd className="text-xs font-medium text-gray-900">{data.fileInfo.fileSize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-600">Format Version:</dt>
                  <dd className="text-xs font-medium text-gray-900">{data.fileInfo.formatVersion}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-600">Simulation Date:</dt>
                  <dd className="text-xs font-medium text-gray-900">
                    {new Date(data.fileInfo.simulationDate).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Data Summary</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-600">Total Nodes:</dt>
                  <dd className="text-xs font-medium text-gray-900">{data.summary.nodeCount.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-600">Total Links:</dt>
                  <dd className="text-xs font-medium text-gray-900">{data.summary.linkCount.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-600">Simulation Duration:</dt>
                  <dd className="text-xs font-medium text-gray-900">{data.summary.simulationDuration}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-600">Time Step:</dt>
                  <dd className="text-xs font-medium text-gray-900">{data.summary.timeStep}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gray-900">Export Options</h4>
            <div className="flex space-x-3">
              <Button
                onClick={() => onExport('csv')}
                className="bg-secondary text-white hover:bg-secondary/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export All Data (CSV)
              </Button>
              <Button
                variant="outline"
                onClick={() => onExport('pdf')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export Report (PDF)
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nodes" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Node Analysis Results</h4>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter nodes..."
                  value={nodeFilter}
                  onChange={(e) => setNodeFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={() => onExport('csv')}
                size="sm"
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    Node ID <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    Max Depth ({getLengthUnit()}) <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    Max Water Level ({getLengthUnit()}) <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    Flooding ({getFlowUnit()}) <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNodeData.map((node) => (
                  <TableRow key={node.nodeId}>
                    <TableCell className="font-medium">{node.nodeId}</TableCell>
                    <TableCell className="font-mono">{formatNumber(node.maxDepth, settings.precision)}</TableCell>
                    <TableCell className="font-mono">{formatNumber(node.maxWaterLevel, settings.precision)}</TableCell>
                    <TableCell className="font-mono">{formatNumber(node.flooding, settings.precision)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(node.status)}>
                        {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{nodePage * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min((nodePage + 1) * pageSize, filteredNodeData.length)}
              </span>{' '}
              of <span className="font-medium">{filteredNodeData.length}</span> results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNodePage(Math.max(0, nodePage - 1))}
                disabled={nodePage === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => setNodePage(nodePage + 1)}
                disabled={(nodePage + 1) * pageSize >= filteredNodeData.length}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="links" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Link Analysis Results</h4>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter links..."
                  value={linkFilter}
                  onChange={(e) => setLinkFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={() => onExport('csv')}
                size="sm"
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    Link ID <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    Max Flow ({getFlowUnit()}) <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    Max Velocity ({getLengthUnit()}/s) <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    Capacity (%) <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLinkData.map((link) => (
                  <TableRow key={link.linkId}>
                    <TableCell className="font-medium">{link.linkId}</TableCell>
                    <TableCell className="font-mono">{formatNumber(link.maxFlow, settings.precision)}</TableCell>
                    <TableCell className="font-mono">{formatNumber(link.maxVelocity, settings.precision)}</TableCell>
                    <TableCell className="font-mono">{formatNumber(link.capacity, settings.precision)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(link.status)}>
                        {link.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{linkPage * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min((linkPage + 1) * pageSize, filteredLinkData.length)}
              </span>{' '}
              of <span className="font-medium">{filteredLinkData.length}</span> results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLinkPage(Math.max(0, linkPage - 1))}
                disabled={linkPage === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => setLinkPage(linkPage + 1)}
                disabled={(linkPage + 1) * pageSize >= filteredLinkData.length}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mass-balance" className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Mass Balance Summary</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-4">Inflow Components</h5>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Total Rainfall:</dt>
                  <dd className="text-sm font-medium text-gray-900 font-mono">
                    {formatNumber(data.massBalance.totalRainfall, settings.precision)} cf
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Dry Weather Flow:</dt>
                  <dd className="text-sm font-medium text-gray-900 font-mono">
                    {formatNumber(data.massBalance.dryWeatherFlow, settings.precision)} cf
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">External Inflow:</dt>
                  <dd className="text-sm font-medium text-gray-900 font-mono">
                    {formatNumber(data.massBalance.externalInflow, settings.precision)} cf
                  </dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <dt className="text-sm font-semibold text-gray-900">Total Inflow:</dt>
                  <dd className="text-sm font-semibold text-gray-900 font-mono">
                    {formatNumber(data.massBalance.totalInflow, settings.precision)} cf
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-4">Outflow Components</h5>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">System Outflow:</dt>
                  <dd className="text-sm font-medium text-gray-900 font-mono">
                    {formatNumber(data.massBalance.systemOutflow, settings.precision)} cf
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Flooding:</dt>
                  <dd className="text-sm font-medium text-gray-900 font-mono">
                    {formatNumber(data.massBalance.flooding, settings.precision)} cf
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Losses:</dt>
                  <dd className="text-sm font-medium text-gray-900 font-mono">
                    {formatNumber(data.massBalance.losses, settings.precision)} cf
                  </dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <dt className="text-sm font-semibold text-gray-900">Total Outflow:</dt>
                  <dd className="text-sm font-semibold text-gray-900 font-mono">
                    {formatNumber(data.massBalance.totalOutflow, settings.precision)} cf
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-blue-500 mt-1">⚖️</div>
              <div>
                <h6 className="text-sm font-semibold text-blue-900 mb-2">Mass Balance Check</h6>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Continuity Error:</span>
                    <span className="font-mono font-medium text-blue-900 ml-2">
                      {formatNumber(data.massBalance.continuityError, 1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Volume Error:</span>
                    <span className="font-mono font-medium text-blue-900 ml-2">
                      {formatNumber(data.massBalance.volumeError, settings.precision)} cf
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(data.massBalance.status)}`}>
                      {data.massBalance.status.charAt(0).toUpperCase() + data.massBalance.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
