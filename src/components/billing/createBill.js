import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Popconfirm, Layout, Breadcrumb, message, Select, Row, Col, DatePicker, Card, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { api } from '../../util/api';
import { useSelector } from 'react-redux';
import useDocumentTitle from '../../hook/useDocumentTitle';
import dayjs from 'dayjs';

const { Option } = Select;

export const CreateBill = () => {
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [total, setTotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  useDocumentTitle('Create New Billing');
  const [form] = Form.useForm();

  useEffect(() => {
    const today = dayjs();

    form.setFieldsValue({
      items: [{ description: '', qty: '', rate: '', amount: '', unit: 'piece' }],
      location: '',
      packing: '',
      gst: '',
      total_tax: '',
      grand_total: '',
      total: '',
      billing_date: today,
    });
  }, [form]);

  const handleAdd = () => {
    const fields = form.getFieldValue('items') || [];
    form.setFieldsValue({
      items: [...fields, { description: '', qty: '', rate: '', amount: '', unit: 'piece' }],
    });
  };

  const handleRemove = (index) => {
    const fields = form.getFieldValue('items') || [];
    if (fields.length > 1) {
      const newFields = fields.filter((_, i) => i !== index);
      form.setFieldsValue({ items: newFields });
      calculateTotals();
    }
  };

  const calculateAmount = (qty, rate) => {
    return (qty * rate).toFixed(2);
  };

  const calculateTotals = () => {
    const fields = form.getFieldValue('items') || [];
    const packing = parseFloat(form.getFieldValue('packing') || 0);
    const gstAmount = parseFloat(form.getFieldValue('gst') || 0); // GST as a flat amount

    const subTotal = fields.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    const totalTax = gstAmount; // GST amount added directly
    const grandTotal = (subTotal + totalTax + packing).toFixed(2);
    const total = subTotal.toFixed(2);

    setTotal(total);
    setTotalTax(totalTax);
    setGrandTotal(grandTotal);
    form.setFieldsValue({
      total_tax: totalTax,
      grand_total: grandTotal,
      total: total
    });
  };

  const handleFieldChange = (name, index) => {
    const fields = form.getFieldValue('items') || [];
    const field = fields[index];
    const newAmount = calculateAmount(parseFloat(field.qty || 0), parseFloat(field.rate || 0));

    form.setFieldsValue({
      items: fields.map((item, i) => (
        i === index
          ? { ...item, amount: newAmount }
          : item
      )),
    });

    calculateTotals();
  };

  const handleNonRepeatingFieldChange = () => {
    calculateTotals();
  };

  const breadcrumbItems = [
    {
      title: <Link to="/">Home</Link>,
    },
    {
      title: <Link to="/bills">Bills</Link>,
    },
    {
      title: 'New Bill',
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      calculateTotals();
      const { token } = user;
      const response = await api.post('/create-billing', {
        ...values,
        total,
        total_tax: totalTax,
        grand_total: grandTotal
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      message.success('Bill created successfully!');
      console.log('API Response:', response.data);
      setLoading(false);
      form.resetFields();
      form.setFieldsValue({
        items: [{ description: '', qty: '', rate: '', amount: '', unit: 'piece' }]
      });
      setTotal(0);
      setTotalTax(0);
      setGrandTotal(0);

    } catch (error) {
      message.error('Failed to create bill. Please try again.');
      console.error('API Error:', error);
    }
  };

  return (
    <Layout style={{ padding: '0 16px 16px' }}>
      <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
      <Card title="Create New Bill" bordered={false} style={{ backgroundColor: 'white', padding: '14px', borderRadius: '18px' }}>
        <Form
          form={form}
          name="dynamic_form_nest_item"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={[16, 16]} style={{ paddingBottom:'10px' }}>
          <Col xs={24} md={3}>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Title is required' }]}
              >
                <Select placeholder="Select Title">
                  <Option value="Mr">Mr</Option>
                  <Option value="Ms">Ms</Option>
                  <Option value="Mrs">Mrs</Option>
                  <Option value="Dr">Dr</Option>
                  <Option value="Prof">Prof</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="customer_name"
                label="Customer Name"
                rules={[{ required: true, message: 'Customer Name is required' }]}
              >
                <Input placeholder="Customer Name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Location is required' }]}
              >
                <Input placeholder="Location" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="billing_date"
                label="Billing Date"
                rules={[{ required: true, message: 'Billing Date is required' }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.List name="items">
            {(fields) => (
              <>
                {fields.map(({ key, name }, index) => (
                  <Card key={key} bordered={true} style={{ marginBottom: 16 }}>
                    <Row gutter={[16, 16]} align="middle" style={{display: 'flex',alignItems: 'baseline'}}>
                    <Col xs={24} md={1}>
                        SR. {index + 1}
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name={[name, 'description']}
                          label="Description"
                          rules={[{ required: true, message: 'Missing Description' }]}
                        >
                          <Input placeholder="Description" />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={3}>
                        <Form.Item
                          name={[name, 'qty']}
                          label="Quantity"
                          rules={[{ required: true, message: 'Missing Quantity' }]}
                        >
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Quantity"
                            onChange={() => handleFieldChange(name, index)}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item
                          name={[name, 'unit']}
                          label="Unit"
                          rules={[{ required: false, message: 'Unit (optional)' }]}
                        >
                          <Select placeholder="Select Unit">
                            <Option value="piece">Piece</Option>
                            <Option value="dozen">Dozen</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={3}>
                        <Form.Item
                          name={[name, 'rate']}
                          label="Rate"
                          rules={[{ required: true, message: 'Missing Rate' }]}
                        >
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Rate"
                            onChange={() => handleFieldChange(name, index)}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={3}>
                        <Form.Item
                          name={[name, 'amount']}
                          label="Amount"
                          rules={[{ required: true, message: 'Missing Amount' }]}
                        >
                          <Input type="number" placeholder="Amount" readOnly />
                        </Form.Item>
                      </Col>

                    
                      <Col xs={6} md={1}>
                        <Popconfirm
                          title="Are you sure you want to delete this item?"
                          onConfirm={() => handleRemove(index)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button
                            type="link"
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={handleAdd}
                    icon={<PlusOutlined />}
                  >
                    Add Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Row gutter={[16, 16]} style={{ paddingTop:'10px',paddingBottom:'10px' }}>
           <Col xs={24} md={{ span: 12, offset: 12 }}>
              <Card title="Totals" bordered={true}>
                <Form.Item label="Total">
                  <div>{total === 0 ? "0.00" : total}</div>
                </Form.Item>
                <Form.Item
                  name="gst"
                  label="GST"
                >
                  <Input type="number" step="0.01"
                    placeholder="GST" onChange={handleNonRepeatingFieldChange} />
                </Form.Item>
                <Form.Item
                  name="packing"
                  label="Packaging"
                >
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Packaging"
                    onChange={handleNonRepeatingFieldChange}
                  />
                </Form.Item>
                <Form.Item label="Grand Total">
                  <div>{grandTotal === 0 ? "0.00" : grandTotal}</div>
                </Form.Item>

              </Card>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={loading}>
              {loading ? <Spin /> : 'Save Changes'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
};
