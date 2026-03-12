import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createUser, createReseller, getAllResellers, getResellerById, updateReseller, deleteReseller, deleteUser, getUserById } from "./db";

describe("Admin Reseller Operations", () => {
  let testResellerId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user first
    const testUser = await createUser({
      username: "test_reseller_vitest",
      passwordHash: "hashed_password",
      name: "Test Reseller Vitest",
      role: "reseller",
      status: "active",
    });
    testUserId = testUser.id;

    // Create a test reseller
    const testReseller = await createReseller({
      userId: testUserId,
      companyName: "Vitest Reseller Company",
      type: "credit",
      status: "active",
      initialCredits: 500,
    });
    testResellerId = testReseller.id;
  });

  it("should fetch all resellers", async () => {
    const resellers = await getAllResellers();
    expect(Array.isArray(resellers)).toBe(true);
    expect(resellers.length).toBeGreaterThan(0);
    expect(resellers.some((r) => r.id === testResellerId)).toBe(true);
  });

  it("should update reseller status", async () => {
    // Update status to suspended
    await updateReseller(testResellerId, {
      status: "suspended",
    });

    // Verify the update
    const updated = await getResellerById(testResellerId);
    expect(updated?.status).toBe("suspended");
  });

  it("should update reseller company name", async () => {
    const newName = "Updated Vitest Company";
    
    // Update company name
    await updateReseller(testResellerId, {
      companyName: newName,
    });

    // Verify the update
    const updated = await getResellerById(testResellerId);
    expect(updated?.companyName).toBe(newName);
  });

  it("should delete reseller", async () => {
    // Delete the reseller
    await deleteReseller(testResellerId);

    // Verify deletion
    const deleted = await getResellerById(testResellerId);
    expect(deleted).toBeUndefined();
  });

  it("should delete reseller but not the associated user (user deletion is handled by tRPC mutation)", async () => {
    // Create another test reseller
    const newUser = await createUser({
      username: `test_reseller_vitest_${Date.now()}`,
      passwordHash: "hashed_password",
      name: "Test Reseller Vitest 2",
      role: "reseller",
      status: "active",
    });

    const newReseller = await createReseller({
      userId: newUser.id,
      companyName: "Vitest Reseller Company 2",
      type: "credit",
      status: "active",
      initialCredits: 500,
    });

    // Delete the reseller
    await deleteReseller(newReseller.id);

    // Verify reseller is deleted
    const deletedReseller = await getResellerById(newReseller.id);
    expect(deletedReseller).toBeUndefined();
    
    // Note: User is NOT deleted by db.deleteReseller - that's handled by the tRPC mutation
    const stillExistingUser = await getUserById(newUser.id);
    expect(stillExistingUser).toBeDefined();
    
    // Cleanup
    await deleteUser(newUser.id);
  });

  afterAll(async () => {
    // Cleanup - delete test user if still exists
    try {
      await deleteUser(testUserId);
    } catch (e) {
      // User might already be deleted
    }
  });
});
