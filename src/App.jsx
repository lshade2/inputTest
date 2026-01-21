import { Box, ButtonGroup, Button, css } from '@mui/material';

import { DataGrid, GridActionsCellItem, GridCellModes, GridRow, Toolbar, useGridApiRef } from '@mui/x-data-grid'
import React from 'react';

function App() {

  const rows = useStateProperty([
    new Register('var1', 'uint8', null, false, 'Описание'),
    new Register('var2', 'uint8', null, false, 'Описание'),
    new Register('var3', 'uint8', null, false, 'Описание'),
    new Register('var4', 'uint8', null, false, 'Описание'),
    new Register('var5', 'uint8', null, false, 'Описание'),
    new Register('var6', 'uint8', null, false, 'Описание'),
    new Register('var7', 'uint8', null, false, 'Описание'),
    new Register('var8', 'uint8', null, false, 'Описание'),
    new Register('var9', 'uint8', null, false, 'Описание'),
    new Register('var10', 'uint8', null, false, 'Описание'),
  ]);

  const gridApi = useGridApiRef();

  /**
   * @param {Register} newRow 
   * @param {Register} oldRow 
   */
  function handleProcessRowUpdate(newRow, oldRow) {
    const isUpdate = Object.entries(oldRow).some(([key, value]) => newRow[key] != value);
    if (isUpdate) {
      const index = rows.get.indexOf(rows.get.find(row => getRowId(row) == getRowId(oldRow)));
      const newRows = [...rows.get];
      newRows[index] = new Register(newRow.name, newRow.type, newRow.bit, newRow.writable, newRow.description);
      rows.set(newRows);
      return newRow; // Возвращаем обновленный ряд для применения изменений
    } else {
      return oldRow;
    }
  };

  function handleCellClick(params, event) {
    if (event.target.nodeType === 1 && !event.currentTarget.contains(event.target)) return;

    if (params.isEditable && gridApi.current.getCellMode(params.id, params.field) == GridCellModes.View) {
      gridApi.current.startCellEditMode({ id: params.id, field: params.field });
    }
  }

  function handleRowUpdateError(error) {
    // console.log('ERROR!', error);
  };

  const key = useStateProperty(0);

  React.useEffect(() => {
    const handleResize = () => key.set(key.get + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  function getRowId(row) {
    return row.name;
  }

  return (
    <DataGrid
      sx={ResponsibleDataGrid}
      key={key.get}
      apiRef={gridApi}
      rows={rows.get}
      editMode="cell"
      disableColumnMenu={true}
      hideFooterSelectedRowCount={true}
      disableRowSelectionOnClick={true}
      showCellVerticalBorder={true}
      showColumnVerticalBorder={true}
      showToolbar={true}
      hideFooter={true}
      onCellClick={handleCellClick}
      getRowId={getRowId}
      processRowUpdate={handleProcessRowUpdate}
      onProcessRowUpdateError={handleRowUpdateError}
      columns={[
        {
          field: 'drag', headerName: 'drag', editable: false, sortable: false,
          renderCell: (params) => <Box draggable={true} sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ height: '30px', width: '30px' }}></Box>
          </Box>
        },
        {
          field: 'name', headerName: 'Название', editable: true, sortable: false, flex: 1,
          valueGetter: (value) => {
            if (value != null) {
              return value;
            }
          },
        },
        {
          field: 'type', headerName: 'Тип', editable: true, type: 'singleSelect', sortable: false, width: 80, valueOptions: Object.values([]),
          valueSetter: (value, row) => ({ ...row, type: value, bit: null }),
        },
        {
          field: 'bit', headerName: 'Бит', editable: true, type: 'singleSelect', width: 60, sortable: false,
          valueOptions: (params) => {
            const maxBitValue = 15 * 8;
            const bits = [];
            bits.push('-');
            for (let i = 0; i < maxBitValue; i++) {
              bits.push(i);
            }
            return bits;
          },
          valueGetter: (value) => value == null ? '-' : `${value}`,
          valueFormatter: (value) => value == '-' ? '' : `${value}`, // только пока не работает с селектом
        },
        { field: 'description', headerName: 'Описание', editable: true, flex: 1 },
      ]}
    />
  )
}

const ResponsibleDataGrid = css`
	@media(max-width: 768px) {
		.toolBar > * {
			display:flex;
			flex-direction: column;
		}
	},
	& .duplicate-warning {
		background: linear-gradient(90deg, #fff3cd 0%, #ffeaa7 100%) !important;
		boxShadow: inset 0 0 0 2px #ffc107;
		animation: duplicatePulse  1.5s infinite;
	},
	@keyframes duplicatePulse {
		0%, 100% { 
			opacity: 1; 
			transform: scale(1);
		}
  		50% { 
			opacity: 0.7;
			transform: scale(1.02);
		}
	}
`;

/**
 * @template T
 * @param {T} initialValue
 * @param {String} debugText
 */
function useStateProperty(initialValue, debugText = '') {
  const [state, setState] = React.useState(initialValue);
  /**
   * @param {T|((prev_val:T)=>T)} value
   */
  const setter = (value) => {
    //console.info('set' + debugText, value);
    if (debugText != '') {
      console.info(debugText, value);
    }
    setState(value);
  };
  return {
    get: state,
    set: setter,
    /**
     * @param {Partial<T>} partial
     * @description только для анонимных типов (т.к. для создания НЕ анонимных нужно использовать new T())
     */
    setPartial: (partial) => {
      //setter(Object.assign(state, partial));  не создает новый экземпляр
      setter({ ...state, ...partial });
    },
    setInitial: () => setter(initialValue),
  };
}

class Register {

  /**
   * @param {String} name 
   * @param {String} type 
   * @param {Number?} bit 
   * @param {Boolean} writable
   * @param {String} description 
   */
  constructor(name, type, bit, writable, description) {
    this.name = name;
    this.type = type;
    this.bit = bit;
    this.writable = writable;
    this.description = description;
  }

}

export default App
