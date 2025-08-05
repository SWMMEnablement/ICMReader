import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { conversionSettingsSchema, insertPrnFileSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.prn')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .prn and .txt files are allowed.'));
    }
  },
});

// Unit conversion utilities
const CONVERSION_FACTORS = {
  M3S_TO_CFS: 35.3147,
  CFS_TO_M3S: 1 / 35.3147,
  M_TO_FT: 3.28084,
  FT_TO_M: 1 / 3.28084,
};

function convertUnits(value: number, fromUnit: string, toUnit: string, precision: number = 2): number {
  let convertedValue = value;
  
  if (fromUnit === 'm3s' && toUnit === 'cfs') {
    convertedValue = value * CONVERSION_FACTORS.M3S_TO_CFS;
  } else if (fromUnit === 'cfs' && toUnit === 'm3s') {
    convertedValue = value * CONVERSION_FACTORS.CFS_TO_M3S;
  } else if (fromUnit === 'm' && toUnit === 'ft') {
    convertedValue = value * CONVERSION_FACTORS.M_TO_FT;
  } else if (fromUnit === 'ft' && toUnit === 'm') {
    convertedValue = value * CONVERSION_FACTORS.FT_TO_M;
  }
  
  return Number(convertedValue.toFixed(precision));
}

function parsePrnFile(fileContent: string) {
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Basic PRN file parsing logic
  const nodeData = [];
  const linkData = [];
  let massBalance = {
    totalRainfall: 0,
    dryWeatherFlow: 0,
    externalInflow: 0,
    totalInflow: 0,
    systemOutflow: 0,
    flooding: 0,
    losses: 0,
    totalOutflow: 0,
    continuityError: 0,
    volumeError: 0,
    status: 'acceptable' as const,
  };

  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect sections
    if (line.toLowerCase().includes('node') && line.toLowerCase().includes('analysis')) {
      currentSection = 'nodes';
      continue;
    } else if (line.toLowerCase().includes('link') && line.toLowerCase().includes('analysis')) {
      currentSection = 'links';
      continue;
    } else if (line.toLowerCase().includes('mass') && line.toLowerCase().includes('balance')) {
      currentSection = 'mass_balance';
      continue;
    }
    
    // Parse data based on current section
    if (currentSection === 'nodes') {
      const parts = line.split(/\s+/);
      if (parts.length >= 4 && parts[0].match(/^[A-Z0-9_]+$/)) {
        nodeData.push({
          nodeId: parts[0],
          maxDepth: parseFloat(parts[1]) || 0,
          maxWaterLevel: parseFloat(parts[2]) || 0,
          flooding: parseFloat(parts[3]) || 0,
          status: (parseFloat(parts[3]) || 0) > 0 ? 'flooding' : 'normal' as const,
        });
      }
    } else if (currentSection === 'links') {
      const parts = line.split(/\s+/);
      if (parts.length >= 4 && parts[0].match(/^[A-Z0-9_]+$/)) {
        const capacity = parseFloat(parts[3]) || 0;
        linkData.push({
          linkId: parts[0],
          maxFlow: parseFloat(parts[1]) || 0,
          maxVelocity: parseFloat(parts[2]) || 0,
          capacity: capacity,
          status: capacity > 90 ? 'near-capacity' : 'normal' as const,
        });
      }
    } else if (currentSection === 'mass_balance') {
      if (line.toLowerCase().includes('rainfall')) {
        const match = line.match(/[\d.]+/);
        if (match) massBalance.totalRainfall = parseFloat(match[0]);
      } else if (line.toLowerCase().includes('outflow')) {
        const match = line.match(/[\d.]+/);
        if (match) massBalance.systemOutflow = parseFloat(match[0]);
      } else if (line.toLowerCase().includes('error')) {
        const match = line.match(/[\d.]+/);
        if (match) massBalance.continuityError = parseFloat(match[0]);
      }
    }
  }

  // Calculate totals
  massBalance.totalInflow = massBalance.totalRainfall + massBalance.dryWeatherFlow + massBalance.externalInflow;
  massBalance.totalOutflow = massBalance.systemOutflow + massBalance.flooding + massBalance.losses;
  massBalance.volumeError = massBalance.totalInflow - massBalance.totalOutflow;

  return {
    fileInfo: {
      filename: 'uploaded.prn',
      fileSize: `${(fileContent.length / 1024).toFixed(1)} KB`,
      formatVersion: 'ICM InfoWorks',
      simulationDate: new Date().toISOString(),
    },
    summary: {
      nodeCount: nodeData.length,
      linkCount: linkData.length,
      simulationDuration: '24 hours',
      timeStep: '15 seconds',
    },
    nodeData,
    linkData,
    massBalance,
  };
}

function convertPrnData(data: any, settings: any) {
  const { flowUnits, lengthUnits, precision } = settings;
  
  // Convert node data
  if (lengthUnits !== 'no-conversion') {
    const [fromUnit, toUnit] = lengthUnits.split('-to-');
    data.nodeData = data.nodeData.map((node: any) => ({
      ...node,
      maxDepth: convertUnits(node.maxDepth, fromUnit, toUnit, precision),
      maxWaterLevel: convertUnits(node.maxWaterLevel, fromUnit, toUnit, precision),
    }));
  }
  
  // Convert link data
  if (flowUnits !== 'no-conversion') {
    const [fromUnit, toUnit] = flowUnits.split('-to-').map((unit: string) => 
      unit === 'si' ? 'm3s' : unit === 'us' ? 'cfs' : unit
    );
    
    data.linkData = data.linkData.map((link: any) => ({
      ...link,
      maxFlow: convertUnits(link.maxFlow, fromUnit, toUnit, precision),
    }));
    
    // Convert velocity if length units are also being converted
    if (lengthUnits !== 'no-conversion') {
      const [lengthFrom, lengthTo] = lengthUnits.split('-to-');
      data.linkData = data.linkData.map((link: any) => ({
        ...link,
        maxVelocity: convertUnits(link.maxVelocity, lengthFrom, lengthTo, precision),
      }));
    }
  }
  
  return data;
}

function generateCSV(data: any): string {
  let csv = '';
  
  // Node data CSV
  csv += 'Node Data\n';
  csv += 'Node ID,Max Depth,Max Water Level,Flooding,Status\n';
  data.nodeData.forEach((node: any) => {
    csv += `${node.nodeId},${node.maxDepth},${node.maxWaterLevel},${node.flooding},${node.status}\n`;
  });
  
  csv += '\nLink Data\n';
  csv += 'Link ID,Max Flow,Max Velocity,Capacity,Status\n';
  data.linkData.forEach((link: any) => {
    csv += `${link.linkId},${link.maxFlow},${link.maxVelocity},${link.capacity},${link.status}\n`;
  });
  
  csv += '\nMass Balance\n';
  csv += 'Component,Value\n';
  csv += `Total Rainfall,${data.massBalance.totalRainfall}\n`;
  csv += `System Outflow,${data.massBalance.systemOutflow}\n`;
  csv += `Continuity Error,${data.massBalance.continuityError}\n`;
  
  return csv;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload and parse PRN file
  app.post("/api/prn/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      const parseData = parsePrnFile(fileContent);
      
      const file = await storage.createPrnFile({
        filename: req.file.originalname,
        originalSize: req.file.size,
        fileContent,
        parseData,
      });

      res.json({ 
        fileId: file.id,
        data: parseData
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process file"
      });
    }
  });

  // Convert units for parsed data
  app.post("/api/prn/convert", async (req, res) => {
    try {
      const { fileId, settings } = req.body;
      
      // Validate settings
      const validatedSettings = conversionSettingsSchema.parse(settings);
      
      const file = await storage.getPrnFile(fileId);
      if (!file || !file.parseData) {
        return res.status(404).json({ message: "File not found" });
      }

      const convertedData = convertPrnData(file.parseData, validatedSettings);
      
      res.json(convertedData);
    } catch (error) {
      console.error('Conversion error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to convert units"
      });
    }
  });

  // Export data as CSV
  app.get("/api/prn/:fileId/export", async (req, res) => {
    try {
      const { fileId } = req.params;
      const { settings } = req.query;
      
      const file = await storage.getPrnFile(fileId);
      if (!file || !file.parseData) {
        return res.status(404).json({ message: "File not found" });
      }

      let data = file.parseData;
      
      // Apply conversions if settings provided
      if (settings) {
        const parsedSettings = JSON.parse(settings as string);
        const validatedSettings = conversionSettingsSchema.parse(parsedSettings);
        data = convertPrnData(data, validatedSettings);
      }
      
      const csv = generateCSV(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename.replace('.prn', '')}_converted.csv"`);
      res.send(csv);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to export data"
      });
    }
  });

  // List uploaded files
  app.get("/api/prn/files", async (req, res) => {
    try {
      const files = await storage.listPrnFiles();
      res.json(files);
    } catch (error) {
      console.error('List files error:', error);
      res.status(500).json({ 
        message: "Failed to list files"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
