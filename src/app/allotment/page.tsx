"use client";

import { useState } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Box, CheckCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function AllotmentPage() {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedLineman, setSelectedLineman] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pieceRate, setPieceRate] = useState('');
  
  const [success, setSuccess] = useState('');

  const { data: masterData, isLoading } = useQuery({
    queryKey: ['masterData'],
    queryFn: async () => {
      const res = await api.get('/admin/master-data');
      return res.data;
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      await api.post('/admin/production-orders', orderData);
    },
    onSuccess: () => {
      setSuccess('Production Order created and bundles generated successfully!');
      setSelectedArticle(null);
      setSelectedLineman('');
      setQuantity('');
      setPieceRate('');
    },
    onError: (err) => {
      console.error(err);
      alert('Failed to create order');
    }
  });

  const handleAllot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !selectedLineman || !quantity || !pieceRate) return;

    setSuccess('');
    createOrderMutation.mutate({
      articleName: selectedArticle.name,
      quantity: parseInt(quantity),
      pieceRate: parseFloat(pieceRate),
      assignedLinemanId: selectedLineman
    });
  };

  const articles = masterData?.articles || [];
  const linemen = masterData?.linemen || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Product Allotment</h2>
        <p className="text-muted-foreground">
          Assign new articles to linemen and set piece rates.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Box className="h-5 w-5" />
              <span>Available Articles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <p>Loading articles...</p> : (
              <div className="space-y-4">
                {articles.length === 0 ? (
                  <p className="text-sm text-slate-500">No articles available.</p>
                ) : (
                  articles.map((article: any) => (
                    <div 
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article);
                        setPieceRate(article.rate.toString());
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedArticle?.id === article.id 
                          ? 'bg-slate-50 border-blue-500 ring-1 ring-blue-500' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-900">{article.name}</p>
                          <p className="text-sm text-slate-500">Base Rate: ₹{article.rate}</p>
                        </div>
                        {selectedArticle?.id === article.id && (
                          <CheckCircle className="text-blue-600 h-5 w-5" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Assign & Allot</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                {success}
              </div>
            )}
            <form onSubmit={handleAllot} className="space-y-6">
              <div className="space-y-2">
                <Label>Selected Article</Label>
                <div className="p-3 bg-slate-100 rounded-md font-medium text-slate-700">
                  {selectedArticle ? selectedArticle.name : 'Please select an article from the left'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Total Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    required
                    disabled={!selectedArticle}
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="e.g., 500" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="piece_rate">Piece Rate (₹)</Label>
                  <Input 
                    id="piece_rate" 
                    type="number" 
                    step="0.01"
                    required
                    disabled={!selectedArticle}
                    value={pieceRate}
                    onChange={e => setPieceRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineman">Assign To Lineman</Label>
                <select 
                  id="lineman" 
                  required
                  disabled={!selectedArticle || isLoading}
                  value={selectedLineman}
                  onChange={e => setSelectedLineman(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a Lineman...</option>
                  {linemen.map((lm: any) => (
                    <option key={lm.id} value={lm.id}>{lm.name}</option>
                  ))}
                </select>
              </div>

              <Button 
                type="submit"
                disabled={!selectedArticle || createOrderMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createOrderMutation.isPending ? 'Creating...' : 'Approve & Allot Order'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
