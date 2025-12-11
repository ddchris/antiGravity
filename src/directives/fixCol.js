
// v-fixCol Directive
// Usage: v-fixCol="{ l: 2, r: 1 }"
// Freezes the first 'l' columns to the left and last 'r' columns to the right.

const updateStickyStyles = (el, binding) => {
  const { l = 0, r = 0 } = binding.value || {};
  
  if (!el) return;

  // We need to target both header and body rows
  // Element Plus structure: .el-table__header-wrapper table, .el-table__body-wrapper table
  const tables = el.querySelectorAll('table');
  
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
      const cells = row.children; // th or td
      const totalCells = cells.length;
      
      // 1. Process Left Sticky Columns
      let leftOffset = 0;
      for (let i = 0; i < totalCells; i++) {
        const cell = cells[i];
        
        // Reset first
        cell.style.position = '';
        cell.style.left = '';
        cell.style.zIndex = '';
        
        if (i < l) {
          cell.style.position = 'sticky';
          cell.style.left = `${leftOffset}px`;
          cell.style.zIndex = '10'; // Higher than normal
          // Add border fix if needed (Element Plus has borders)
          cell.style.backgroundColor = 'inherit'; // Ensure background covers scrolling content
           if (cell.tagName === 'TH') {
             cell.style.zIndex = '20'; // Header higher
             cell.style.backgroundColor = 'var(--el-table-header-bg-color)'; 
           } else {
             cell.style.backgroundColor = 'var(--el-bg-color)'; // Use var for dark mode handling
             // Hack: For dark mode stripes, this might be tricky, but basic bg is fine.
             // Better: inherit if possible, but sticky needs opaque bg.
             // Element Plus rows usually have white/dark bg.
             // We'll set it dynamically based on computed style? 
             // Actually, 'inherit' usually works if Row has bg. 
             // But strict sticky needs explicit non-transparent.
           }
           
           // Apply shadow for visual separation (optional)
           if (i === l - 1) {
             cell.style.borderRight = '1px solid var(--el-border-color-lighter)';
             // cell.style.boxShadow = '2px 0 5px rgba(0,0,0,0.1)'; 
           }

          leftOffset += cell.offsetWidth;
        }
      }

      // 2. Process Right Sticky Columns
      let rightOffset = 0;
      for (let i = totalCells - 1; i >= 0; i--) {
        const cell = cells[i];
        const rightIndex = totalCells - 1 - i;
        
        if (rightIndex < r) {
            cell.style.position = 'sticky';
            cell.style.right = `${rightOffset}px`;
            cell.style.zIndex = '10';
            
            if (cell.tagName === 'TH') {
             cell.style.zIndex = '20';
             cell.style.backgroundColor = 'var(--el-table-header-bg-color)'; 
            } else {
             cell.style.backgroundColor = 'var(--el-bg-color)';
            }

            // Separator logic
            if (rightIndex === r - 1) {
                cell.style.borderLeft = '1px solid var(--el-border-color-lighter)';
            }

            rightOffset += cell.offsetWidth;
        }
      }
    });
  });
};

export default {
  mounted(el, binding) {
    // Initial calculation
    // Timeout to ensure element plus has rendered column widths
    setTimeout(() => {
        updateStickyStyles(el, binding);
    }, 200);

    // Observer for resize
    const resizeObserver = new ResizeObserver(() => {
        updateStickyStyles(el, binding);
    });
    resizeObserver.observe(el);
    el._fixColObserver = resizeObserver;
  },
  updated(el, binding) {
     // Run on updates (data changes)
     setTimeout(() => {
        updateStickyStyles(el, binding);
    }, 200);
  },
  unmounted(el) {
    if (el._fixColObserver) {
      el._fixColObserver.disconnect();
    }
  }
};
