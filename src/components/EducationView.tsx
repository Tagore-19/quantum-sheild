/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Beginner & Expert Quantum Education Center
 * Dual-tier explanations (Simple + Technical + Visual Example) for all fundamental QKD concepts
 */

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  Shield,
  Zap,
  Info,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

interface ConceptTopic {
  id: string;
  title: string;
  category: 'FOUNDATION' | 'PROTOCOL' | 'SECURITY' | 'REAL_WORLD';
  simpleExplanation: string;
  technicalExplanation: string;
  concreteExample: string;
  visualBraKet: string;
}

export const EducationView: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('qkd');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const topics: ConceptTopic[] = [
    {
      id: 'qubit',
      title: 'What is a Qubit?',
      category: 'FOUNDATION',
      simpleExplanation:
        'A classical bit is like a light switch: it is strictly OFF (0) or ON (1). A qubit is a quantum system (such as the polarization angle of a single particle of light, a photon) that can be in state 0, state 1, or both at the same time until measured.',
      technicalExplanation:
        'A qubit is a two-level quantum mechanical state described mathematically by a unit vector in a 2-dimensional complex Hilbert space: |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability amplitudes satisfying |α|² + |β|² = 1.',
      concreteExample:
        'In BB84, a horizontal photon represents |0⟩, while a vertical photon represents |1⟩.',
      visualBraKet: '|ψ⟩ = α|0⟩ + β|1⟩',
    },
    {
      id: 'superposition',
      title: 'What is Superposition?',
      category: 'FOUNDATION',
      simpleExplanation:
        'Superposition is the physical ability of a quantum particle to exist simultaneously across multiple states until an observation or measurement is performed.',
      technicalExplanation:
        'Linear combination of orthogonal basis states prior to wave-function collapse. In quantum optics, a photon polarized at a diagonal 45° angle is in an equal superposition of horizontal and vertical polarization: |+⟩ = (|0⟩ + |1⟩) / √2.',
      concreteExample:
        'A diagonal photon |+⟩ contains equal 50% probability amplitudes of collapsing to |0⟩ or |1⟩ if forced through a vertical/horizontal polarizer.',
      visualBraKet: '|+⟩ = (|0⟩ + |1⟩) / √2',
    },
    {
      id: 'basis',
      title: 'What is a Measurement Basis (Z vs X)?',
      category: 'FOUNDATION',
      simpleExplanation:
        'A basis is the "measuring grid" or perspective through which you choose to observe the photon. In BB84, there are two distinct bases: the Rectilinear (Z) basis (up/down and left/right) and the Diagonal (X) basis (tilted 45 degrees).',
      technicalExplanation:
        'A set of orthonormal eigenvectors spanning the Hilbert space. The computational basis Z = {|0⟩, |1⟩} (Pauli σz eigenstates) and the Hadamard/diagonal basis X = {|+⟩, |–⟩} (Pauli σx eigenstates) are mutually unbiased bases (MUBs). Measuring an eigenstate of one basis in the other produces maximal uncertainty (entropy).',
      concreteExample:
        'If you wear vertical sunglasses, you measure in the Z basis. If you tilt your head 45 degrees, you measure in the X basis.',
      visualBraKet: 'Z = {|0⟩, |1⟩}  ⟷  X = {|+⟩, |–⟩}',
    },
    {
      id: 'qkd',
      title: 'What is Quantum Key Distribution (QKD)?',
      category: 'PROTOCOL',
      simpleExplanation:
        'QKD is not a way to send secret messages directly; it is a way to create an identical, shared, unbreakable random secret key between two legitimate parties (Alice and Bob) across an optical fiber.',
      technicalExplanation:
        'A symmetric key-negotiation method utilizing quantum mechanics rather than computational complexity (such as RSA or ECC). Because quantum states cannot be measured without disturbance, any eavesdropping attempt produces measurable error, guaranteeing forward secrecy and information-theoretic security.',
      concreteExample:
        'Alice and Bob generate a 256-bit random key. If no eavesdropper touched the photons, they use this key with One-Time Pad or AES-GCM to encrypt power grid SCADA control commands.',
      visualBraKet: 'Alice (Photons) ⟶ Optical Fiber ⟶ Bob (Detectors)',
    },
    {
      id: 'bb84',
      title: 'What is the BB84 Protocol?',
      category: 'PROTOCOL',
      simpleExplanation:
        'Invented by Charles Bennett and Gilles Brassard in 1984, BB84 was the world’s very first quantum cryptographic protocol. It uses 4 polarization states across 2 non-orthogonal bases to securely negotiate cryptographic keys.',
      technicalExplanation:
        '1. Alice transmits random bits encoded in randomly chosen Z or X bases. 2. Bob measures in randomly chosen Z or X bases. 3. Over a classical channel, they compare bases (sifting). 4. They estimate error rate (QBER). 5. If QBER < threshold, they perform error correction and privacy amplification.',
      concreteExample:
        'If Alice transmits 1000 photons, ~500 will be measured in matching bases. They compare 200 bits to verify security, and keep 300 bits as the confidential key.',
      visualBraKet: 'States: |0⟩, |1⟩ (Z) and |+⟩, |–⟩ (X)',
    },
    {
      id: 'alice_bob_eve',
      title: 'Who are Alice, Bob, and Eve?',
      category: 'PROTOCOL',
      simpleExplanation:
        'In cybersecurity, "Alice" is the sender (e.g. Central Power Grid Control Center), "Bob" is the intended receiver (e.g. Remote Electrical Substation), and "Eve" is the eavesdropper attempting to intercept communications.',
      technicalExplanation:
        'Alice: Sender preparing quantum states. Bob: Receiver performing projective POVM measurements. Eve: Adversary attempting eavesdropping, modeled in this prototype via an intercept-resend attack.',
      concreteExample:
        'Alice wants to send breaker commands to Bob. Eve taps the fiber line outside the substation.',
      visualBraKet: 'Alice ⟶ [Eve Interceptor] ⟶ Bob',
    },
    {
      id: 'measurement_collapse',
      title: 'What is Quantum Measurement & Collapse?',
      category: 'SECURITY',
      simpleExplanation:
        'In the quantum realm, looking at something changes it! When a detector measures a photon, its delicate superposition collapses into a single definitive state.',
      technicalExplanation:
        'Heisenberg Uncertainty Principle and the Born Rule (wave-function reduction). A state |ψ⟩ collapses instantaneously upon projective measurement into an eigenstate of the observable being measured with probability P(i) = |⟨i|ψ⟩|².',
      concreteExample:
        'If Eve intercepts a diagonal photon |+⟩ and measures it with a horizontal/vertical filter, the photon collapses into strictly horizontal or vertical. Its original diagonal identity is permanently erased.',
      visualBraKet: '⟨ψ|M|ψ⟩ ⟶ State Collapse',
    },
    {
      id: 'sifting',
      title: 'What is Basis Reconciliation & Sifting?',
      category: 'PROTOCOL',
      simpleExplanation:
        'Alice and Bob publicly tell each other which filter (basis) they used for each photon, but NOT the bit value! They keep only the photons where their filters happened to match.',
      technicalExplanation:
        'Because both parties select bases uniformly at random from {Z, X}, P(bA = bB) = 0.5. By discarding incompatible basis measurements, they eliminate the 50% random noise that would result from conjugate basis measurements, leaving a correlated sifted key.',
      concreteExample:
        'Alice used Z; Bob used Z → KEPT! Alice used Z; Bob used X → DISCARDED!',
      visualBraKet: 'b_A == b_B ? KEEP : DISCARD',
    },
    {
      id: 'qber',
      title: 'What is Quantum Bit Error Rate (QBER)?',
      category: 'SECURITY',
      simpleExplanation:
        'QBER is the percentage of mismatched bits between Alice and Bob in their sifted key. It is the vital "alarm system" of QKD.',
      technicalExplanation:
        'QBER = (Mismatched Sifted Bits) / (Total Compared Sifted Bits). It quantifies the mutual information between Alice and Bob versus an eavesdropper. In BB84, if QBER exceeds the asymptotic threshold (~11%), the theoretical secret key extraction rate drops to zero.',
      concreteExample:
        'Alice and Bob compare 100 sample sifted bits. If 12 bits differ, the QBER is 12.0%. Since 12.0% > 11.0%, they abort the exchange!',
      visualBraKet: 'QBER = N_error / N_sample',
    },
    {
      id: 'eavesdropping_impact',
      title: 'Why Does Eavesdropping Inevitably Alter QBER?',
      category: 'SECURITY',
      simpleExplanation:
        'Due to the No-Cloning Theorem, Eve cannot copy photons. To eavesdrop, she must intercept and measure them. Half the time, she guesses the wrong basis, scrambling the photons and introducing errors that Bob immediately detects!',
      technicalExplanation:
        'When Eve uses an intercept-resend attack on 100% of qubits: P(Eve basis error) = 0.5. When Bob measures in Alice’s basis, Eve’s collapsed state yields an error with probability 0.5. Total induced QBER = 0.5 × 0.5 = 25%. Eve cannot spy without alerting Bob.',
      concreteExample:
        'Even if Eve tries to intercept only 20% of the photons, she inevitably introduces ~5% extra QBER into the system.',
      visualBraKet: 'QBER_eve = 0.25 × p_eve',
    },
    {
      id: 'simulation_vs_reality',
      title: 'Simulation vs. Real-World QKD Deployments',
      category: 'REAL_WORLD',
      simpleExplanation:
        'This software simulator demonstrates the pure mathematics and logic of BB84 on your screen. Real-world QKD is physical hardware operating with lasers, single-photon detectors, and optical fiber cables.',
      technicalExplanation:
        'Real-world QKD requires: 1. Weak coherent laser pulses or entangled photon pairs. 2. Fiber dark counts & detector dead-times. 3. Decoy state protocols to prevent photon-number-splitting (PNS) attacks. 4. Cascade or LDPC error reconciliation. 5. Toeplitz hash privacy amplification. 6. Classical channel authentication (Wegman-Carter).',
      concreteExample:
        'A real QKD device in a substation sits in a 19-inch rack with cryogenic cooling, fiber interfaces, and a hardware security module.',
      visualBraKet: 'Software Model ≠ Physical Photonic Hardware',
    },
  ];

  const filteredTopics = topics.filter((t) => {
    if (activeCategory === 'ALL') return true;
    return t.category === activeCategory;
  });

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  return (
    <div className="space-y-6">
      {/* Educational Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Q-SHIELD Quantum Education Center
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive beginner-to-expert guide explaining the physics, mathematics, and operational security of Quantum Key Distribution.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'FOUNDATION', 'PROTOCOL', 'SECURITY', 'REAL_WORLD'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-4">
          {filteredTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                selectedTopicId === topic.id
                  ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                {topic.category}
              </span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                {topic.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Topic Deep-Dive Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              Topic Module: {selectedTopic.category}
            </span>
            <h3 className="text-xl font-bold text-slate-100 mt-1 font-sans">
              {selectedTopic.title}
            </h3>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-cyan-300 text-sm font-bold">
            {selectedTopic.visualBraKet}
          </div>
        </div>

        {/* 3 Explanation Layers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Layer 1: Simple / Beginner Explanation */}
          <div className="bg-slate-950 p-5 rounded-xl border border-cyan-900/60 space-y-2">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              1. Plain English (Beginner Friendly)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedTopic.simpleExplanation}
            </p>
          </div>

          {/* Layer 2: Technical & Physics Explanation */}
          <div className="bg-slate-950 p-5 rounded-xl border border-purple-900/60 space-y-2">
            <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              2. Technical & Mathematical Mechanics
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedTopic.technicalExplanation}
            </p>
          </div>
        </div>

        {/* Layer 3: Concrete Physical / Scenario Example */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-200 uppercase font-mono">
              Real-World Critical Infrastructure Context:
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedTopic.concreteExample}
            </p>
          </div>
        </div>

        {/* Polarization Bases Reference Matrix */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-200 mb-3 font-mono uppercase">
            BB84 Four-State Polarization Reference Chart
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-center">
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-cyan-400 font-bold text-lg">|0⟩</span>
              <p className="text-slate-200 font-bold mt-1">Bit 0 in Z Basis</p>
              <p className="text-[10px] text-slate-400">Horizontal (0°)</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-cyan-400 font-bold text-lg">|1⟩</span>
              <p className="text-slate-200 font-bold mt-1">Bit 1 in Z Basis</p>
              <p className="text-[10px] text-slate-400">Vertical (90°)</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-purple-400 font-bold text-lg">|+⟩</span>
              <p className="text-slate-200 font-bold mt-1">Bit 0 in X Basis</p>
              <p className="text-[10px] text-slate-400">Diagonal (+45°)</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-purple-400 font-bold text-lg">|–⟩</span>
              <p className="text-slate-200 font-bold mt-1">Bit 1 in X Basis</p>
              <p className="text-[10px] text-slate-400">Diagonal (-45°)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
