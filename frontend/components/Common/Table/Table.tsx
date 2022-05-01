/* eslint-disable react/no-unstable-nested-components */
import {
  ActionIcon, Button, Checkbox, Group, LoadingOverlay, Paper, Popover, ScrollArea, Stack, Table, Text, TextInput, useMantineTheme
} from '@mantine/core';
import { IoClose, IoSearch, IoTrash } from 'react-icons/io5';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { BsPlusLg } from 'react-icons/bs';
import {
  useTable, useSortBy, usePagination, useGlobalFilter, useRowSelect, useFlexLayout
} from 'react-table';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useViewportSize } from '@mantine/hooks';

const CustomTable = ({
  columns, data, deleteMutation, openCreateModal = null, rowHeight = false, hiddenColumns = [], openCreateDisabled = false,
}) => {
  const { width } = useViewportSize();

  const theme = useMantineTheme();
  const [delPopover, setDelPopover] = useState(false);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    setGlobalFilter,
    selectedFlatRows,
    toggleAllPageRowsSelected,
    setHiddenColumns
  } = useTable(
    {
      columns,
      data,
      disableResizing: true
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useFlexLayout,
    (hooks) => {
      hooks.visibleColumns.push((hookColumns) => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <Checkbox
              {...getToggleAllRowsSelectedProps()}
            />
          ),
          Cell: ({ row }) => (
            <Checkbox
              {...row.getToggleRowSelectedProps()}
            />
          ),
          maxWidth: 52,
          minWidth: 52,
          width: 52
        },
        ...hookColumns
      ]);
    }
  );

  useEffect(() => {
    if (width < 1000) {
      setHiddenColumns(hiddenColumns);
    } else if (width >= 1000) {
      setHiddenColumns([]);
    }
  }, [width]);

  return (
    <Container>
      <Group noWrap mb="md" spacing="sm">
        {openCreateModal && (
          <Button
            leftIcon={<BsPlusLg />}
            onClick={openCreateModal}
            disabled={openCreateDisabled}
          >
            New
          </Button>
        )}
        <TextInput
          placeholder="Search"
          icon={<IoSearch />}
          value={useGlobalFilter.value}
          onChange={(event) => setGlobalFilter(event.target.value)}
          sx={{ width: '100%' }}
        />
        <Group position="right">
          <Popover
            opened={delPopover && selectedFlatRows.length > 0}
            onClose={() => setDelPopover(false)}
            target={(
              <Button
                loading={deleteMutation.isLoading}
                color="red"
                leftIcon={<IoTrash />}
                disabled={selectedFlatRows.length === 0}
                onClick={() => setDelPopover((o) => !o)}
              >
                Delete
              </Button>
            )}
            spacing="sm"
            position="bottom"
            placement="end"
            withArrow
          >
            <Stack>
              <Text size="sm">Are you sure?</Text>
              <Group noWrap>
                <Button
                  compact
                  variant="default"
                  leftIcon={<IoClose />}
                  onClick={() => setDelPopover(false)}
                >
                  Cancel
                </Button>
                <Button
                  compact
                  loading={deleteMutation.isLoading}
                  color="red"
                  leftIcon={<IoTrash />}
                  onClick={() => {
                    deleteMutation.mutate(selectedFlatRows.map((row) => row.original._id));
                    toggleAllPageRowsSelected(false);
                  }}
                >
                  Delete
                </Button>
              </Group>
            </Stack>
          </Popover>
        </Group>
      </Group>
      <StyledTable {...getTableProps()}>
        <Header p={4}>
          {headerGroups.map((headerGroup) => (
            <HeaderRow noWrap {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <HeaderCell
                  theme={theme}
                  maxWidth={column.maxWidth}
                  isSorted={column.isSorted}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  <Group position="apart">
                    <Text size="sm" weight={700}>{column.render('Header')}</Text>
                    {column.canSort && (
                      <ActionIcon variant="transparent">
                        {column.isSorted && (column.isSortedDesc ? <FaSortDown /> : <FaSortUp />)}
                        {!column.isSorted && <FaSort />}
                      </ActionIcon>
                    )}
                  </Group>
                </HeaderCell>
              ))}
            </HeaderRow>
          ))}
        </Header>
        <Body grow spacing={0} component={ScrollArea} {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <BodyRow theme={theme} height={rowHeight} {...row.getRowProps()}>
                <LoadingOverlay visible={row.original.loading} />
                {row.cells.map((cell) => (
                  <BodyCell height={rowHeight} maxWidth={cell.column.maxWidth} {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </BodyCell>
                ))}
              </BodyRow>
            );
          })}
          {page.length === 0 && (
            <span>No results!</span>
          )}
        </Body>
      </StyledTable>
    </Container>
  );
};

const Container = styled.div`
  display: block;
  max-width: 100%;
  height: 100%;
`;

const StyledTable = styled(Table).attrs({
  as: 'div'
})`
  height: calc(100% - 52px);
  max-height: calc(100% - 52px);
`;

const Header = styled(Paper).attrs({
  p: 0
})``;

const HeaderRow = styled(Group)`
  gap: 0;
`;

const HeaderCell = styled.div`
  max-width: ${({ maxWidth }) => maxWidth}px;
  background-color: ${({ isSorted, theme }) => (isSorted && theme.colors.dark[6])};
  padding: 8px 16px;
  user-select: none;
  transition: background-color 0.2s ease-in-out;

  .mantine-ActionIcon-transparent svg {
    transition: opacity 0.2s ease-in-out;
    opacity: ${({ isSorted }) => (isSorted ? 1 : 0)};
  }

  &:hover .mantine-ActionIcon-transparent svg {
    opacity: 1;
  }
`;

const Body = styled(Stack)`
  max-height: calc(100% - 36px);
`;

const BodyRow = styled(Paper).attrs({
  p: 0
})`
  position: relative;
  overflow: hidden;

  :nth-child(even) {
    background-color: ${({ theme }) => theme.colors.dark[7]} !important;
  }
  :nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.dark[8]} !important;
  }

  ${({ height }) => height && `
    height: ${height}px;
    max-height: ${height}px;
  `}
`;

const BodyCell = styled.div`
  display: flex;
  align-items: center;
  max-width: ${({ maxWidth }) => maxWidth}px;
  padding: 8px 16px;

  ${({ height }) => height && `
    height: ${height}px;
    max-height: ${height}px;
  `}
`;

export default CustomTable;
