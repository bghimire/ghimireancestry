<template>
  <div class="tree-container">
    <svg :width="width" :height="height" class="tree-svg">
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <!-- links -->
        <line
          v-for="(link, i) in links"
          :key="i"
          :x1="link.source.x"
          :y1="link.source.y"
          :x2="link.target.x"
          :y2="link.target.y"
          stroke="#999"
          stroke-width="2"
          :class="{ 'highlighted': link.highlighted }"
        />
        <!-- nodes -->
        <g
          v-for="(node, i) in nodes"
          :key="i"
          @click="selectNode(node)"
          class="node-group"
          style="cursor: pointer"
        >
          <circle
            :cx="node.x"
            :cy="node.y"
            r="30"
            :class="{ 'selected': selected === node, 'highlighted': node.highlighted }"
          />
          <text
            :x="node.x"
            :y="node.y + 4"
            text-anchor="middle"
            font-size="12"
            fill="#fff"
          >
            {{ node.name }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selected = ref(null)

const treeData = {
  name: 'Great Grandpa',
  children: [
    { name: 'Son 1', children: [
      { name: 'S1-G1' },
      { name: 'S1-G2' },
      { name: 'S1-G3' },
      { name: 'S1-G4' },
      { name: 'S1-G5' },
      { name: 'S1-G6' }
    ]},
    { name: 'Son 2' },
    { name: 'Son 3' },
    { name: 'Son 4' },
    { name: 'Son 5' },
    { name: 'Son 6' },
    { name: 'Son 7' },
    { name: 'Son 8' },
    { name: 'Son 9' }
  ]
}

const width = 900
const height = 600
const margin = { left: 50, top: 50 }

const nodes = ref([])
const links = ref([])

function buildTree() {
  const resultNodes = []
  const resultLinks = []
  let y = 0
  let nodeId = 0

  function traverse(node, parent, depth) {
    const id = nodeId++
    const x = (depth * 200) + 50
    const yPos = y * 70 + 100
    if (depth === 0) y = 0
    if (depth === 1 && parent === treeData) {
      // position 9 sons
      const idx = parent.children.indexOf(node)
      const start = (9 - 1) * 35
      node._x = 200 + idx * 70 - start
    }
    if (depth === 2 && parent?.name?.startsWith('Son 1')) {
      const idx = parent.children.indexOf(node)
      const start = (6 - 1) * 35
      node._x = 400 + idx * 70 - start
    }
    const n = { id, name: node.name, children: node.children || [], parent, x: node._x || x, y: yPos, depth }
    resultNodes.push(n)
    if (parent) {
      resultLinks.push({ source: parent._node || getParentNode(parent), target: n })
    }
    if (node.children) {
      node.children.forEach(c => traverse(c, node, depth + 1))
    }
    y++
  }

  function getParentNode(p) {
    return { x: p._x || (p.depth * 200 + 50), y: p.yPos || 100 }
  }

  // assign parent nodes references
  function assignRefs() {
    // simpler: rebuild with refs
  }

  // better approach
  const tempNodes = []
  const tempLinks = []
  let idCounter = 0
  let rowCounter = 0
  
  function walk(node, parent, depth) {
    const id = idCounter++
    let x
    if (depth === 0) {
      x = width / 2
    } else if (depth === 1) {
      const siblings = treeData.children
      const idx = siblings.indexOf(node)
      const total = siblings.length
      const spacing = 70
      x = (width / 2) + (idx - (total - 1) / 2) * spacing
    } else if (depth === 2) {
      const siblings = parent.children
      const idx = siblings.indexOf(node)
      const total = siblings.length
      const spacing = 60
      x = parent.x + (idx - (total - 1) / 2) * spacing
    } else {
      x = parent.x
    }
    const y = margin.top + depth * 120
    const n = { id, name: node.name, children: node.children || [], parent, x, y, depth, highlighted: false }
    tempNodes.push(n)
    if (parent) {
      tempLinks.push({ source: parent, target: n, highlighted: false })
    }
    if (node.children) {
      node.children.forEach(c => walk(c, n, depth + 1))
    }
  }
  
  walk(treeData, null, 0)
  nodes.value = tempNodes
  links.value = tempLinks
}

function selectNode(node) {
  selected.value = node
  // reset
  nodes.value.forEach(n => {
    n.highlighted = false
  })
  links.value.forEach(l => {
    l.highlighted = false
  })
  // highlight path to root and node + its descendants
  let current = node
  const highlightedNodes = new Set()
  while (current) {
    highlightedNodes.add(current.id)
    current = current.parent
  }
  // add descendants
  function addDesc(n) {
    n.children.forEach(c => {
      const child = nodes.value.find(x => x.name === c.name && x.parent === n)
      if (child) {
        highlightedNodes.add(child.id)
        addDesc(child)
      }
    })
  }
  addDesc(node)
  
  nodes.value.forEach(n => {
    if (highlightedNodes.has(n.id)) n.highlighted = true
  })
  links.value.forEach(l => {
    if (highlightedNodes.has(l.target.id)) l.highlighted = true
  })
}

buildTree()
</script>

<style scoped>
.tree-container {
  overflow-x: auto;
  padding: 20px 0;
}
.tree-svg {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.node-group circle {
  fill: #4a90e2;
  stroke: #2c5aa0;
  stroke-width: 2;
  transition: all 0.2s;
}
.node-group circle.selected {
  fill: #e24a4a;
  stroke: #a02c2c;
  r: 35;
}
.node-group circle.highlighted {
  fill: #50c878;
  stroke: #2d8b57;
  filter: drop-shadow(0 0 4px rgba(80, 200, 120, 0.6));
}
.node-group text {
  pointer-events: none;
  user-select: none;
}
line {
  transition: all 0.2s;
}
line.highlighted {
  stroke: #50c878;
  stroke-width: 3;
}
</style>
