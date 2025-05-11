import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { Switch } from "@/components/ui/switch";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Textarea } from "@/components/ui/textarea";
  import { Icons } from "@/components/icons";
  
  export default function SettingsPage() {
    return (
      <div className="grid gap-6">
        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>
              Update your restaurant details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  defaultValue="FoodDash Restaurant"
                  placeholder="Your restaurant name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  defaultValue="+1 (555) 123-4567"
                  placeholder="Contact number"
                />
              </div>
            </div>
  
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                defaultValue="123 Main St, Cityville"
                placeholder="Full address"
              />
            </div>
  
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue="We serve delicious food with the freshest ingredients"
                placeholder="Brief description"
                rows={3}
              />
            </div>
  
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
  
        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>
              Set your restaurant's operating hours
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { day: "Monday", open: "09:00", close: "21:00" },
                { day: "Tuesday", open: "09:00", close: "21:00" },
                { day: "Wednesday", open: "09:00", close: "21:00" },
                { day: "Thursday", open: "09:00", close: "21:00" },
                { day: "Friday", open: "09:00", close: "22:00" },
                { day: "Saturday", open: "10:00", close: "22:00" },
                { day: "Sunday", open: "10:00", close: "20:00" },
              ].map(({ day, open, close }) => (
                <div key={day} className="flex items-center justify-between gap-4">
                  <Label className="w-24">{day}</Label>
                  <div className="flex items-center gap-2 flex-1">
                    <Input type="time" defaultValue={open} className="w-full" />
                    <span>to</span>
                    <Input type="time" defaultValue={close} className="w-full" />
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
  
            <div className="flex justify-end">
              <Button>Update Hours</Button>
            </div>
          </CardContent>
        </Card>
  
        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Settings</CardTitle>
            <CardDescription>
              Configure delivery options and fees
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="delivery-fee">Delivery Fee</Label>
                <Input
                  id="delivery-fee"
                  type="number"
                  defaultValue="3.99"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="min-order">Minimum Order Amount</Label>
                <Input
                  id="min-order"
                  type="number"
                  defaultValue="15.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="delivery-radius">Delivery Radius (miles)</Label>
                <Input
                  id="delivery-radius"
                  type="number"
                  defaultValue="5"
                  min="1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delivery-time">Estimated Delivery Time</Label>
                <Select defaultValue="45">
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
  
            <div className="flex items-center space-x-2">
              <Switch id="delivery-enabled" defaultChecked />
              <Label htmlFor="delivery-enabled">Enable Delivery Service</Label>
            </div>
  
            <div className="flex justify-end">
              <Button>Save Delivery Settings</Button>
            </div>
          </CardContent>
        </Card>
  
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Manage accepted payment options
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cash-on-delivery">Cash on Delivery</Label>
                <Switch id="cash-on-delivery" defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">
                Accept cash payments when order is delivered
              </p>
            </div>
  
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="online-payment">Online Payments</Label>
                <Switch id="online-payment" defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">
                Accept credit/debit cards and mobile payments
              </p>
            </div>
  
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="paystack">Paystack Integration</Label>
                <Switch id="paystack" defaultChecked />
              </div>
              <div className="grid gap-2 mt-2">
                <Label htmlFor="paystack-key">API Key</Label>
                <Input
                  id="paystack-key"
                  type="password"
                  placeholder="sk_test_********"
                />
              </div>
            </div>
  
            <div className="flex justify-end">
              <Button>Update Payment Methods</Button>
            </div>
          </CardContent>
        </Card>
  
        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              System configuration and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <div className="flex items-center space-x-2">
                <Switch id="maintenance" />
                <span className="text-sm text-muted-foreground">
                  Temporarily disable the website for maintenance
                </span>
              </div>
            </div>
  
            <div className="grid gap-2">
              <Label htmlFor="backup">Database Backup</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Icons.download className="mr-2 h-4 w-4" />
                  Download Backup
                </Button>
                <Button variant="outline">
                  <Icons.menu className="mr-2 h-4 w-4" />
                  Restore Backup
                </Button>
              </div>
            </div>
  
            <div className="grid gap-2">
              <Label htmlFor="cache">Clear Cache</Label>
              <Button variant="outline" className="w-fit">
                <Icons.refresh className="mr-2 h-4 w-4" />
                Clear All Cache
              </Button>
            </div>
  
            <div className="flex justify-end">
              <Button variant="destructive">Reset All Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }