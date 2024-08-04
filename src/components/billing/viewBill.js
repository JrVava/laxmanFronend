import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Button, Table, Layout, Spin, Row, Col } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { api } from '../../util/api'; // Adjust the import path as needed
import { useReactToPrint } from 'react-to-print';
import useDocumentTitle from '../../hook/useDocumentTitle';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

export const ViewBill = () => {
    const { id } = useParams();
    const [billDetails, setBillDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef();
    const [printPages, setPrintPages] = useState([]);
    const recordsPerPage = 20;

    useDocumentTitle('View Billing');

    useEffect(() => {
        const fetchBillDetails = async () => {
            try {
                const response = await api.get(`/get-bill/${id}`);
                setBillDetails(response.data);
            } catch (error) {
                console.error('Error fetching bill details:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBillDetails();
    }, [id]);

    useEffect(() => {
        if (billDetails) {
            const { billings } = billDetails;
            const pages = [];
            for (let i = 0; i < billings.length; i += recordsPerPage) {
                const pageRecords = billings.slice(i, i + recordsPerPage);
                pages.push(pageRecords);
            }
            setPrintPages(pages);
        }
    }, [billDetails]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        pageStyle: `
            @media print {
            @page {
                size: A5; 
                margin: 10mm;
            }
            body {
                margin: 0;
                
            }
            .ant-card-body {
                padding: 0 !important;
                border: none !important;
            }
            .print-header {
                margin: 0;
                padding: 0;
                
            }
            .print-table {
                margin: 0;
                padding: 0;
                font-size: 8px; /* Adjust font size to fit content */
                width: 100%;
                border-collapse: collapse;
                border: none;
                page-break-inside: auto;
                
            }
            .print-table th, .print-table td {
                padding: 0 !important;
                margin: 0 !important;
                border: 1px solid #ddd !important;
                
            }
            .print-table th.sr-col, .print-table td.sr-col {
                padding-left: 10px !important; /* Add left padding to the SR column */
            }
            .print-table .total-cell {
                padding-left: 10px !important; /* Add left padding to the Total cell */
            }
            .print-table tr:last-child td {
                border-bottom: 1px solid #ddd; /* Ensure bottom border */
            }
            .print-table {
                page-break-inside: auto;
                
            }
            .print-table tr {
                page-break-inside: avoid;
                
            }
        }
    `,
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}><Spin size="large" /></div>;
    if (!billDetails) return <p>No bill details found</p>;

    const { customer, billing_detail } = billDetails;

    const billingColumns = [
        {
            title: 'SR',
            dataIndex: 'sr',
            key: 'sr',
            width: '8%',
            className: 'sr-col', // Add className for SR column
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: '30%',
            className: 'sr-col',
        },
        {
            title: 'QTY',
            dataIndex: 'qty',
            key: 'qty',
            width: '10%',
            className: 'sr-col',
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            width: '12%',
            className: 'sr-col',
        },
        {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
            width: '12%',
            className: 'sr-col',
        },
       
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: '18%',
            className: 'sr-col',
        },
    ];

    const printTable = (records, pageIndex) => (
        <Table
            columns={billingColumns}
            dataSource={records.map((record, index) => ({
                ...record,
                sr: index + 1, // Reset serial number for each page
            }))}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
            className="print-table"
            summary={pageData => {
                let totalAmount = 0;
                pageData.forEach(({ amount }) => {
                    totalAmount += amount;
                });

                return (
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={1} colSpan={5} className="total-cell">
                            Total
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} className="total-cell">
                            {totalAmount}
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                );
            }}
        />
    );

    const printContent = () => (
        <div
            style={{
                padding: '0',
                margin: '0',
                boxSizing: 'border-box',
                fontSize: '8px', // Ensure consistent font size
                width: '100%',
            }}
        >
            {printPages.map((pageRecords, index) => (
                <div
                    key={`page-${index}`}
                    style={{
                        pageBreakAfter: index < printPages.length - 1 ? 'always' : 'auto',
                        margin: '0',
                        padding: '0',
                        boxSizing: 'border-box',
                        width: '100%',
                    }}
                >
                    {printTable(pageRecords, index)}
                </div>
            ))}
        </div>
    );

    return (
        <Layout style={{ padding: '0 24px' }}>
            <Content style={{ padding: '14px', minHeight: '280px' }}>
                <Button 
                    type="primary" 
                    icon={<PrinterOutlined />} 
                    onClick={handlePrint}
                    style={{ marginBottom: '10px' }}
                >
                    Print
                </Button>
                <Card
                    title={
                        <>
                            <Row>
                                <Col span={24} style={{ textAlign: 'center', paddingTop: '0px' ,marginTop: '10px' }}>
                                    <Paragraph style={{ margin: '0' }}><strong>ON APPROVAL / DELIVERY CHALLAN</strong></Paragraph>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24} style={{ textAlign: 'center', paddingTop: '0px' ,marginTop: '10px' }}>
                                    <Paragraph style={{ margin: '0' }}><strong>MJ FASHION MUMBAI</strong></Paragraph>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    {`Bill #${billing_detail.id}`}
                                </Col>
                                <Col span={12} style={{ textAlign: 'right' }}>
                                    <Paragraph style={{ margin: '0' }}><strong>Billing Date:</strong> {dayjs(billing_detail.billing_date).format('YYYY-MM-DD')}</Paragraph>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    {`Name: ${customer.title}. ${customer.name}`}
                                </Col>
                                <Col span={12} style={{ textAlign: 'right' }}>
                                    <Paragraph style={{ margin: '0' }}><strong>Location:</strong> {customer.location}</Paragraph>
                                </Col>
                            </Row>
                        </>
                    }
                    ref={componentRef}
                    className="print-header"
                    style={{ margin: '0', padding: '0' }}
                >
                    <Title level={5} style={{ margin: '0', marginTop: '10px' }}>Billing Items</Title>
                    {printContent()}
                    <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '8px', margin: '0' }}>
                    <Paragraph style={{ margin: '0',marginRight:'10px',marginTop:'10px' }}><strong>Total:</strong> {billing_detail.grand_total - billing_detail.tax -billing_detail.packaging}</Paragraph>
                        <Paragraph style={{ margin: '0',marginRight:'10px' }}><strong>GST:</strong> {billing_detail.tax}</Paragraph>
                        <Paragraph style={{ margin: '0',marginRight:'10px' }}><strong>Packaging:</strong> {billing_detail.packaging}</Paragraph>
                        <Paragraph style={{ margin: '0',marginRight:'10px',marginBottom:'10px' }}><strong>Grand Total:</strong> {billing_detail.grand_total}</Paragraph>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};
