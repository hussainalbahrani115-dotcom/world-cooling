import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../api';
import { Appliance, Diagnosis, DiagnosticNode, NodeType, Part } from '../types';

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  question: 'سؤال',
  paywall: 'بوابة دفع',
  diagnosis: 'تشخيص',
};

function nodeSummary(node: DiagnosticNode): string {
  const prefix = NODE_TYPE_LABELS[node.nodeType];
  if (node.questionText) return `${prefix}: ${node.questionText}`;
  if (node.nodeType === 'diagnosis' && node.diagnoses[0]) return `${prefix}: ${node.diagnoses[0].diagnosisTitle}`;
  return `${prefix} (#${node.id.slice(0, 8)})`;
}

export function TreePage() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [applianceId, setApplianceId] = useState('');
  const [nodes, setNodes] = useState<DiagnosticNode[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Appliance[]>('/admin/appliances').then(setAppliances).catch(() => {});
    api.get<Part[]>('/admin/parts').then(setParts).catch(() => {});
  }, []);

  async function reload() {
    if (!applianceId) return;
    setLoading(true);
    try {
      const tree = await api.get<{ nodes: DiagnosticNode[] }>(`/admin/appliances/${applianceId}/tree`);
      setNodes(tree.nodes);
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر تحميل الشجرة');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applianceId]);

  const rootNodes = useMemo(() => nodes.filter((n) => !n.parentNodeId), [nodes]);
  const childrenOf = (parentId: string) => nodes.filter((n) => n.parentNodeId === parentId);

  return (
    <section className="card">
      <h2>شجرة القرار</h2>
      {error && <div className="error-banner">{error}</div>}

      <div className="inline-form">
        <select value={applianceId} onChange={(e) => setApplianceId(e.target.value)}>
          <option value="">اختر جهازاً...</option>
          {appliances.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nameAr}
            </option>
          ))}
        </select>
      </div>

      {applianceId && (
        <>
          <AddNodeForm applianceId={applianceId} parentNodeId={null} nodes={nodes} onCreated={reload} label="إضافة عقدة جذر جديدة" />

          {loading ? (
            <p>جارٍ التحميل...</p>
          ) : nodes.length === 0 ? (
            <p className="muted">لا توجد عقد بعد لهذا الجهاز.</p>
          ) : (
            <div className="tree-view">
              {rootNodes.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  depth={0}
                  allNodes={nodes}
                  parts={parts}
                  applianceId={applianceId}
                  childrenOf={childrenOf}
                  onChanged={reload}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function NodeCard({
  node,
  depth,
  allNodes,
  parts,
  applianceId,
  childrenOf,
  onChanged,
}: {
  node: DiagnosticNode;
  depth: number;
  allNodes: DiagnosticNode[];
  parts: Part[];
  applianceId: string;
  childrenOf: (parentId: string) => DiagnosticNode[];
  onChanged: () => void;
}) {
  const [error, setError] = useState('');
  const [confidenceInput, setConfidenceInput] = useState(String(node.confidenceWeight ?? ''));
  const [questionInput, setQuestionInput] = useState(node.questionText ?? '');
  const [showAddChild, setShowAddChild] = useState(false);

  async function saveNode() {
    try {
      await api.patch(`/admin/nodes/${node.id}`, {
        questionText: questionInput || undefined,
        confidenceWeight: confidenceInput === '' ? undefined : Number(confidenceInput),
      });
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر حفظ التعديل');
    }
  }

  async function deleteNode() {
    if (!confirm('حذف هذه العقدة؟')) return;
    try {
      await api.delete(`/admin/nodes/${node.id}`);
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر حذف العقدة');
    }
  }

  const children = childrenOf(node.id);

  return (
    <div className="node-card" style={{ marginInlineStart: depth * 24 }}>
      <div className="node-card-header">
        <span className={`badge badge-${node.nodeType}`}>{NODE_TYPE_LABELS[node.nodeType]}</span>
        {error && <span className="error-inline">{error}</span>}
        <button className="danger-btn" onClick={deleteNode}>
          حذف العقدة
        </button>
      </div>

      {node.nodeType === 'question' && (
        <div className="inline-form">
          <input value={questionInput} onChange={(e) => setQuestionInput(e.target.value)} placeholder="نص السؤال" />
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={confidenceInput}
            onChange={(e) => setConfidenceInput(e.target.value)}
            placeholder="وزن الثقة"
          />
          <button onClick={saveNode}>حفظ</button>
        </div>
      )}
      {node.nodeType === 'paywall' && (
        <div className="inline-form">
          <span className="muted">وزن الثقة عند هذه البوابة:</span>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={confidenceInput}
            onChange={(e) => setConfidenceInput(e.target.value)}
          />
          <button onClick={saveNode}>حفظ</button>
        </div>
      )}

      <AnswersEditor node={node} allNodes={allNodes} onChanged={onChanged} />

      {node.nodeType === 'diagnosis' && (
        <DiagnosisEditor node={node} diagnosis={node.diagnoses[0]} parts={parts} onChanged={onChanged} />
      )}

      <div className="node-card-footer">
        <button className="link-btn" onClick={() => setShowAddChild((v) => !v)}>
          {showAddChild ? 'إخفاء' : '+ إضافة عقدة فرعية'}
        </button>
      </div>
      {showAddChild && (
        <AddNodeForm
          applianceId={applianceId}
          parentNodeId={node.id}
          nodes={allNodes}
          onCreated={() => {
            setShowAddChild(false);
            onChanged();
          }}
        />
      )}

      {children.map((child) => (
        <NodeCard
          key={child.id}
          node={child}
          depth={depth + 1}
          allNodes={allNodes}
          parts={parts}
          applianceId={applianceId}
          childrenOf={childrenOf}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}

function AnswersEditor({
  node,
  allNodes,
  onChanged,
}: {
  node: DiagnosticNode;
  allNodes: DiagnosticNode[];
  onChanged: () => void;
}) {
  const [answerText, setAnswerText] = useState('');
  const [nextNodeId, setNextNodeId] = useState('');
  const [error, setError] = useState('');

  async function addAnswer(e: FormEvent) {
    e.preventDefault();
    if (!answerText.trim()) return;
    try {
      await api.post(`/admin/nodes/${node.id}/answers`, { answerText, nextNodeId: nextNodeId || undefined });
      setAnswerText('');
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إضافة الإجابة');
    }
  }

  async function removeAnswer(id: string) {
    if (!confirm('حذف هذه الإجابة؟')) return;
    try {
      await api.delete(`/admin/answers/${id}`);
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر حذف الإجابة');
    }
  }

  if (node.nodeType === 'diagnosis') return null;

  return (
    <div className="answers-editor">
      <strong>الإجابات:</strong>
      {error && <div className="error-inline">{error}</div>}
      <ul className="chip-list">
        {node.answers.map((a) => {
          const target = allNodes.find((n) => n.id === a.nextNodeId);
          return (
            <li key={a.id} className="chip">
              {a.answerText}
              {target && <span className="muted"> → {nodeSummary(target)}</span>}
              {!a.nextNodeId && <span className="error-inline"> (بلا وجهة!)</span>}
              <button className="chip-remove" onClick={() => removeAnswer(a.id)}>
                ×
              </button>
            </li>
          );
        })}
        {node.answers.length === 0 && <li className="muted">لا توجد إجابات بعد</li>}
      </ul>
      <form className="inline-form" onSubmit={addAnswer}>
        <input placeholder="نص الإجابة" value={answerText} onChange={(e) => setAnswerText(e.target.value)} />
        <select value={nextNodeId} onChange={(e) => setNextNodeId(e.target.value)}>
          <option value="">(بدون وجهة بعد)</option>
          {allNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {nodeSummary(n)}
            </option>
          ))}
        </select>
        <button type="submit">إضافة إجابة</button>
      </form>
    </div>
  );
}

function DiagnosisEditor({
  node,
  diagnosis,
  parts,
  onChanged,
}: {
  node: DiagnosticNode;
  diagnosis?: Diagnosis;
  parts: Part[];
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(diagnosis?.diagnosisTitle ?? '');
  const [rootCause, setRootCause] = useState(diagnosis?.rootCause ?? '');
  const [severity, setSeverity] = useState(diagnosis?.severityLevel ?? 'متوسط');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [error, setError] = useState('');

  async function createDiagnosis(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !rootCause.trim()) return;
    try {
      await api.post(`/admin/nodes/${node.id}/diagnosis`, {
        diagnosisTitle: title,
        rootCause,
        severityLevel: severity,
        parts: [],
      });
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إنشاء التشخيص');
    }
  }

  async function saveDiagnosisText() {
    if (!diagnosis) return;
    try {
      await api.patch(`/admin/diagnoses/${diagnosis.id}`, { diagnosisTitle: title, rootCause, severityLevel: severity });
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر حفظ التشخيص');
    }
  }

  async function addPart() {
    if (!diagnosis || !selectedPartId) return;
    const nextParts = [...diagnosis.parts.map((p) => ({ partId: p.partId, isRequired: p.isRequired })), { partId: selectedPartId, isRequired: true }];
    try {
      await api.put(`/admin/diagnoses/${diagnosis.id}/parts`, { parts: nextParts });
      setSelectedPartId('');
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر ربط القطعة');
    }
  }

  async function removePart(partId: string) {
    if (!diagnosis) return;
    const nextParts = diagnosis.parts.filter((p) => p.partId !== partId).map((p) => ({ partId: p.partId, isRequired: p.isRequired }));
    try {
      await api.put(`/admin/diagnoses/${diagnosis.id}/parts`, { parts: nextParts });
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إزالة القطعة');
    }
  }

  async function toggleRequired(partId: string, isRequired: boolean) {
    if (!diagnosis) return;
    const nextParts = diagnosis.parts.map((p) => (p.partId === partId ? { partId, isRequired } : { partId: p.partId, isRequired: p.isRequired }));
    try {
      await api.put(`/admin/diagnoses/${diagnosis.id}/parts`, { parts: nextParts });
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر تحديث القطعة');
    }
  }

  if (!diagnosis) {
    return (
      <form className="diagnosis-editor" onSubmit={createDiagnosis}>
        <strong>لا يوجد تشخيص لهذه العقدة بعد — أنشئ واحداً:</strong>
        {error && <div className="error-inline">{error}</div>}
        <input placeholder="عنوان التشخيص" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="السبب الجذري" value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="منخفض">منخفض</option>
          <option value="متوسط">متوسط</option>
          <option value="عالٍ">عالٍ</option>
          <option value="حرج">حرج</option>
        </select>
        <button type="submit">إنشاء التشخيص</button>
      </form>
    );
  }

  const linkedPartIds = new Set(diagnosis.parts.map((p) => p.partId));
  const availableParts = parts.filter((p) => !linkedPartIds.has(p.id));

  return (
    <div className="diagnosis-editor">
      <strong>التشخيص:</strong>
      {error && <div className="error-inline">{error}</div>}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان التشخيص" />
      <textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="السبب الجذري" />
      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option value="منخفض">منخفض</option>
        <option value="متوسط">متوسط</option>
        <option value="عالٍ">عالٍ</option>
        <option value="حرج">حرج</option>
      </select>
      <button onClick={saveDiagnosisText}>حفظ نص التشخيص</button>

      <div>
        <strong>قطع الغيار المرتبطة:</strong>
        <ul className="chip-list">
          {diagnosis.parts.map((p) => (
            <li key={p.partId} className="chip">
              {p.part.name} ({p.part.sku})
              <label className="muted">
                <input type="checkbox" checked={p.isRequired} onChange={(e) => toggleRequired(p.partId, e.target.checked)} /> مطلوبة
              </label>
              <button className="chip-remove" onClick={() => removePart(p.partId)}>
                ×
              </button>
            </li>
          ))}
          {diagnosis.parts.length === 0 && <li className="muted">لا توجد قطع مرتبطة</li>}
        </ul>
        <div className="inline-form">
          <select value={selectedPartId} onChange={(e) => setSelectedPartId(e.target.value)}>
            <option value="">اختر قطعة...</option>
            {availableParts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
          <button onClick={addPart} disabled={!selectedPartId}>
            ربط قطعة
          </button>
        </div>
      </div>
    </div>
  );
}

function AddNodeForm({
  applianceId,
  parentNodeId,
  nodes,
  onCreated,
  label,
}: {
  applianceId: string;
  parentNodeId: string | null;
  nodes: DiagnosticNode[];
  onCreated: () => void;
  label?: string;
}) {
  const [nodeType, setNodeType] = useState<NodeType>('question');
  const [questionText, setQuestionText] = useState('');
  const [confidenceWeight, setConfidenceWeight] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/admin/appliances/${applianceId}/nodes`, {
        nodeType,
        parentNodeId: parentNodeId || undefined,
        questionText: nodeType === 'question' ? questionText : undefined,
        confidenceWeight: confidenceWeight === '' ? undefined : Number(confidenceWeight),
      });
      setQuestionText('');
      setConfidenceWeight('');
      onCreated();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إنشاء العقدة');
    }
  }

  return (
    <form className="inline-form add-node-form" onSubmit={handleSubmit}>
      {label && <strong>{label}</strong>}
      {error && <span className="error-inline">{error}</span>}
      <select value={nodeType} onChange={(e) => setNodeType(e.target.value as NodeType)}>
        <option value="question">سؤال</option>
        <option value="paywall">بوابة دفع</option>
        <option value="diagnosis">تشخيص</option>
      </select>
      {nodeType === 'question' && (
        <input placeholder="نص السؤال" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
      )}
      <input
        type="number"
        min="0"
        max="1"
        step="0.05"
        placeholder="وزن الثقة عند الوصول لهذه العقدة"
        value={confidenceWeight}
        onChange={(e) => setConfidenceWeight(e.target.value)}
      />
      <button type="submit">إنشاء</button>
      {nodes.length === 0 && parentNodeId === null && <span className="muted">(ستكون هذه أول عقدة/جذر الشجرة)</span>}
    </form>
  );
}
