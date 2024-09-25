import React, { useState, useEffect, useRef } from 'react';
import { useBackend } from '../lib/usebackend.js';

import { TabView, TabPanel } from 'primereact/tabview';

import DataTableNew from './datatableNew.jsx';

export default function Related({ db, table, recordId, reload, forceReload }) {
  const [tables, loading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'childrenGet',
    cache: true,
    filter: (data) => prepTables(data),
    reload,
  });

  const prepTables = (response) => {
    const tablesTemp = [...response.data]; // copy the cached response since we're going to modify it.

    for (const childTable of tablesTemp) {
      for (const [columna, columnb] of Object.entries(childTable.columnmap)) {
        if (!childTable.where) {
          childTable.where = [];
        }
        let right = '';
        switch (columnb) {
          case 'id':
            right = recordId;
            break;
          case 'db':
            right = db;
            break;
          case 'table':
            right = table;
            break;
          default:
            right = recordId;
            break;
        }

        childTable.where.push({ [columna]: right });
      }
    }

    return tablesTemp;
  };

  console.log('Related', db, table, recordId, tables);

  if (loading) {
    console.log('ASDFASDFASDF', 'LOADING');
    return <></>;
  }

  console.log('ASDFASDFASDF', table);

  return (
    <>
      <TabView key={table + 'related'}>
        {tables &&
          tables.length > 0 &&
          tables.map((childTable) => {
            return (
              <TabPanel
                header={childTable.tabName}
                key={
                  table +
                  childTable.tabName +
                  Object.keys(childTable.columnmap)[0]
                } // use the first column we join on as the key
              >
                <DataTableNew
                  db={childTable.db}
                  table={childTable.table}
                  where={childTable.where}
                  closeOnCreate={true}
                  reload={reload}
                  forceReload={forceReload}
                  key={table + childTable.tabName + childTable.table}
                  child={true}
                />
              </TabPanel>
            );
          })}
      </TabView>
    </>
  );
}
