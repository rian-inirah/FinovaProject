import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, Filter, IndianRupee } from "lucide-react";
import { reportsAPI } from "../../services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

const OrderReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: format(new Date(), "yyyy-MM-dd"),
    toDate: format(new Date(), "yyyy-MM-dd"),
    paymentType: "all",
  });

  // ----------------------------
  // Fetch reports on mount
  // ----------------------------
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await reportsAPI.getOrderReports({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        paymentType: filters.paymentType,
      });
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching order reports:", error);
      toast.error("Failed to fetch order reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => fetchReports();

  const resetFilters = () => {
    setFilters({
      fromDate: format(new Date(), "yyyy-MM-dd"),
      toDate: format(new Date(), "yyyy-MM-dd"),
      paymentType: "all",
    });
  };

  const exportToCSV = () => {
    if (!reports?.orders) return;

    const csvData = [
      ["Order Number", "Date", "Total Amount", "Payment Method", "Items Count"],
      ...reports.orders.map((order) => [
        order.orderNumber,
        format(new Date(order.createdAt), "yyyy-MM-dd"),
        order.grandTotal,
        order.paymentMethod,
        order.orderItems.length,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `order-reports-${filters.fromDate}-to-${filters.toDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully!");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-2" size={24} /> Order Reports
        </h1>
        <p className="text-gray-600 mt-1">View all orders and payment breakdown</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold flex items-center">
            <Filter className="mr-2" size={20} /> Filters
          </h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
              <select
                value={filters.paymentType}
                onChange={(e) => handleFilterChange("paymentType", e.target.value)}
                className="input"
              >
                <option value="Online">All</option>
                <option value="Cash">Cash</option>
                
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end space-x-2 mt-2">
              <button onClick={applyFilters} disabled={isLoading} className="btn btn-primary">
                Apply Filters
              </button>
              <button onClick={resetFilters} className="btn btn-secondary">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {reports && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card text-center">
            <div className="card-content">
              <h3 className="text-2xl font-bold text-gray-900">{reports.summary.totalOrders}</h3>
              <p className="text-sm text-gray-600">Orders</p>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-content flex items-center justify-center space-x-1">
              <IndianRupee className="text-green-600" size={20} />
              <h3 className="text-2xl font-bold text-gray-900">{parseFloat(reports.summary.totalAmount || 0).toFixed(2)}</h3>
            </div>
            <p className="text-sm text-gray-600 text-center">Total Revenue</p>
          </div>
          <div className="card text-center">
            <div className="card-content flex items-center justify-center space-x-1">
              <IndianRupee className="text-purple-600" size={20} />
              <h3 className="text-2xl font-bold text-gray-900">{parseFloat(reports.summary.totalGST || 0).toFixed(2)}</h3>
            </div>
            <p className="text-sm text-gray-600 text-center">Total GST</p>
          </div>
        </div>
      )}

      {/* Export */}
      {reports?.orders?.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button onClick={exportToCSV} className="btn btn-secondary">
            <Download size={16} className="mr-2" /> Export to CSV
          </button>
        </div>
      )}

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="spinner w-8 h-8"></div>
        </div>
      ) : (
        <>
          {!reports?.orders?.length ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">No orders in the selected date range</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.orders.map((order) => (
                <div key={order.id} className="card">
                  <div className="card-content flex justify-between">
                    <div>
                      <h4 className="font-semibold">{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600">{format(new Date(order.createdAt), "yyyy-MM-dd")}</p>
                      <p className="text-sm text-gray-600">{order.orderItems.length} item(s)</p>
                    </div>
                    <div className="text-right">
                      <IndianRupee className="inline-block text-green-600" size={16} />
                      <span className="font-bold text-lg text-green-600">{parseFloat(order.grandTotal).toFixed(2)}</span>
                      <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderReports;
