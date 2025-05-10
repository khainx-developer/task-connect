import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  Handle,
  Position,
  ReactFlowInstance,
  NodeProps,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from '@emotion/styled';

const MindmapContainer = styled.div`
  width: 100%;
  height: calc(100vh - 100px);
  background: #f8f9fa;
`;

const ToolboxContainer = styled.div`
  position: absolute;
  left: 20px;
  top: 20px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 5;
  width: 120px;
`;

const ToolboxItem = styled.div`
  padding: 6px 8px;
  margin: 2px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: grab;
  background: white;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  &:hover {
    background: #f0f0f0;
  }
`;

const ActionButton = styled.button`
  padding: 6px 8px;
  margin: 2px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  width: 100%;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
`;

const ColorSwatch = styled.button<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #eee;
  background: ${({ color }) => color};
  margin: 0 2px;
  cursor: pointer;
  &:hover {
    border: 2px solid #333;
  }
`;

const EdgeDeleteButton = styled.button`
  position: absolute;
  z-index: 10;
  background: #fff;
  border: 1px solid #e53e3e;
  color: #e53e3e;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  font-size: 16px;
`;

const COLOR_OPTIONS = [
  { name: 'Yellow', value: '#ffeb3b' },
  { name: 'Green', value: '#4caf50' },
  { name: 'Blue', value: '#2196f3' },
  { name: 'White', value: '#fff' },
];

const MindmapContext = createContext<{
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
  updateNodeLabel: (id: string, label: string) => void;
} | null>(null);

const useMindmap = () => useContext(MindmapContext)!;

const CustomNode = (props: NodeProps) => {
  const { id, data } = props;
  const { editingNodeId, setEditingNodeId, updateNodeLabel } = useMindmap();
  const isEditing = editingNodeId === id;
  return (
    <div
      className="px-4 py-2 shadow-md rounded-md border-2 border-stone-400"
      style={data.style}
      onDoubleClick={() => setEditingNodeId(id)}
    >
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3" />
      <Handle type="target" position={Position.Top} id="top" className="w-3 h-3" />
      <Handle type="target" position={Position.Right} id="right" className="w-3 h-3" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="w-3 h-3" />
      <div className="flex items-center">
        <div className="ml-2">
          {isEditing ? (
            <input
              autoFocus
              defaultValue={data.label}
              onBlur={e => {
                updateNodeLabel(id, e.target.value);
                setEditingNodeId(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  updateNodeLabel(id, (e.target as HTMLInputElement).value);
                  setEditingNodeId(null);
                }
              }}
              className="border rounded px-2 py-1"
            />
          ) : (
            <div>{data.label}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3" />
      <Handle type="source" position={Position.Top} id="top" className="w-3 h-3" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3" />
    </div>
  );
};

const InputNode = (props: NodeProps) => {
  const { id, data } = props;
  const { editingNodeId, setEditingNodeId, updateNodeLabel } = useMindmap();
  const isEditing = editingNodeId === id;
  return (
    <div
      className="px-4 py-2 shadow-md rounded-md border-2 border-blue-400"
      style={data.style}
      onDoubleClick={() => setEditingNodeId(id)}
    >
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3" />
      <Handle type="target" position={Position.Top} id="top" className="w-3 h-3" />
      <Handle type="target" position={Position.Right} id="right" className="w-3 h-3" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="w-3 h-3" />
      <div className="flex items-center">
        <div className="ml-2">
          {isEditing ? (
            <input
              autoFocus
              defaultValue={data.label}
              onBlur={e => {
                updateNodeLabel(id, e.target.value);
                setEditingNodeId(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  updateNodeLabel(id, (e.target as HTMLInputElement).value);
                  setEditingNodeId(null);
                }
              }}
              className="border rounded px-2 py-1"
            />
          ) : (
            <div>{data.label}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3" />
      <Handle type="source" position={Position.Top} id="top" className="w-3 h-3" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3" />
    </div>
  );
};

const OutputNode = (props: NodeProps) => {
  const { id, data } = props;
  const { editingNodeId, setEditingNodeId, updateNodeLabel } = useMindmap();
  const isEditing = editingNodeId === id;
  return (
    <div
      className="px-4 py-2 shadow-md rounded-md border-2 border-green-400"
      style={data.style}
      onDoubleClick={() => setEditingNodeId(id)}
    >
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3" />
      <Handle type="target" position={Position.Top} id="top" className="w-3 h-3" />
      <Handle type="target" position={Position.Right} id="right" className="w-3 h-3" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="w-3 h-3" />
      <div className="flex items-center">
        <div className="ml-2">
          {isEditing ? (
            <input
              autoFocus
              defaultValue={data.label}
              onBlur={e => {
                updateNodeLabel(id, e.target.value);
                setEditingNodeId(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  updateNodeLabel(id, (e.target as HTMLInputElement).value);
                  setEditingNodeId(null);
                }
              }}
              className="border rounded px-2 py-1"
            />
          ) : (
            <div>{data.label}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3" />
      <Handle type="source" position={Position.Top} id="top" className="w-3 h-3" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  input: InputNode,
  output: OutputNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Main Topic', style: {} },
    position: { x: 250, y: 25 },
  },
];

const initialEdges: Edge[] = [];

const Mindmap: React.FC = () => {
  const flowWrapperRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [edgeDeletePos, setEdgeDeletePos] = useState<{ x: number, y: number } | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setEditingNodeId(node.id);
    },
    []
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setEditingNodeId(null);
    setSelectedEdge(null);
    setEdgeDeletePos(null);
  }, []);

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setSelectedEdge(edge);
      if (reactFlowInstance) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (sourceNode && targetNode) {
          const x = (sourceNode.position.x + targetNode.position.x) / 2 + 100;
          const y = (sourceNode.position.y + targetNode.position.y) / 2 + 100;
          setEdgeDeletePos({ x, y });
        }
      }
    },
    [nodes, reactFlowInstance]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: `${nodes.length + 1}`,
        type,
        position,
        data: { label: `${type} node`, style: {} },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setSelectedNode(null);
      setEditingNodeId(null);
    },
    [setNodes, setEdges]
  );

  const updateNodeLabel = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label: newLabel, style: node.data.style } }
            : node
        )
      );
      setEditingNodeId(null);
    },
    [setNodes]
  );

  const updateNodeColor = useCallback(
    (nodeId: string, color: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  style: { ...node.data.style, background: color },
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  const handleDeleteEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
      setEdgeDeletePos(null);
    }
  }, [selectedEdge, setEdges]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedEdge) {
          setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
          setSelectedEdge(null);
          setEdgeDeletePos(null);
        } else if (selectedNode) {
          deleteNode(selectedNode.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdge, selectedNode, deleteNode, setEdges]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mindmap</h1>
      <MindmapContainer>
        <MindmapContext.Provider value={{ editingNodeId, setEditingNodeId, updateNodeLabel }}>
          <ReactFlow
            ref={flowWrapperRef}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            onEdgeClick={onEdgeClick}
            defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
            connectionMode={ConnectionMode.Loose}
          >
            <Background />
            <Controls />
            <ToolboxContainer>
              <h3 className="text-xs font-semibold mb-2">Node Types</h3>
              <ToolboxItem
                onDragStart={(event) => onDragStart(event, 'input')}
                draggable
              >
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Input
              </ToolboxItem>
              <ToolboxItem
                onDragStart={(event) => onDragStart(event, 'custom')}
                draggable
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Default
              </ToolboxItem>
              <ToolboxItem
                onDragStart={(event) => onDragStart(event, 'output')}
                draggable
              >
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Output
              </ToolboxItem>
              
              {selectedNode && (
                <>
                  <div className="mt-4 mb-2 border-t pt-2">
                    <h3 className="text-xs font-semibold mb-2">Node Actions</h3>
                    <ActionButton onClick={() => setEditingNodeId(selectedNode.id)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </ActionButton>
                    <ActionButton onClick={() => deleteNode(selectedNode.id)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </ActionButton>
                    <div className="mt-2">
                      <h4 className="text-xs font-semibold mb-1">Colors</h4>
                      <div className="flex items-center gap-1">
                        {COLOR_OPTIONS.map((color) => (
                          <ColorSwatch
                            key={color.value}
                            color={color.value}
                            title={color.name}
                            onClick={() => updateNodeColor(selectedNode.id, color.value)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </ToolboxContainer>
            {selectedEdge && edgeDeletePos && (
              <EdgeDeleteButton
                style={{ left: edgeDeletePos.x, top: edgeDeletePos.y }}
                onClick={handleDeleteEdge}
                title="Delete link"
              >
                ×
              </EdgeDeleteButton>
            )}
          </ReactFlow>
        </MindmapContext.Provider>
      </MindmapContainer>
    </div>
  );
};

export default Mindmap; 