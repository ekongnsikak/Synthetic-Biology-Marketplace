import { describe, it, beforeEach, expect } from "vitest"

describe("Biosafety Verification Contract", () => {
  let mockStorage: Map<string, any>
  const CONTRACT_OWNER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  
  beforeEach(() => {
    mockStorage = new Map()
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "add-verifier":
        if (sender !== CONTRACT_OWNER) return { success: false, error: 403 }
        mockStorage.set(`verifier-${args[0]}`, true)
        return { success: true }
      
      case "remove-verifier":
        if (sender !== CONTRACT_OWNER) return { success: false, error: 403 }
        mockStorage.delete(`verifier-${args[0]}`)
        return { success: true }
      
      case "verify-organism":
        if (!mockStorage.get(`verifier-${sender}`)) return { success: false, error: 403 }
        mockStorage.set(`verified-${args[0]}`, { is_verified: true, verifier: sender })
        return { success: true }
      
      case "is-organism-verified":
        return {
          success: true,
          value: mockStorage.get(`verified-${args[0]}`) || { is_verified: false, verifier: null },
        }
      
      case "is-verifier":
        return { success: true, value: !!mockStorage.get(`verifier-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should add a verifier", () => {
    const result = mockContractCall("add-verifier", ["user1"], CONTRACT_OWNER)
    expect(result.success).toBe(true)
    expect(mockContractCall("is-verifier", ["user1"], "anyone").value).toBe(true)
  })
  
  it("should remove a verifier", () => {
    mockContractCall("add-verifier", ["user1"], CONTRACT_OWNER)
    const result = mockContractCall("remove-verifier", ["user1"], CONTRACT_OWNER)
    expect(result.success).toBe(true)
    expect(mockContractCall("is-verifier", ["user1"], "anyone").value).toBe(false)
  })
  
  it("should not add or remove verifier if not contract owner", () => {
    const addResult = mockContractCall("add-verifier", ["user2"], "user1")
    expect(addResult.success).toBe(false)
    expect(addResult.error).toBe(403)
    
    mockContractCall("add-verifier", ["user2"], CONTRACT_OWNER)
    const removeResult = mockContractCall("remove-verifier", ["user2"], "user1")
    expect(removeResult.success).toBe(false)
    expect(removeResult.error).toBe(403)
  })
  
  it("should verify an organism", () => {
    mockContractCall("add-verifier", ["verifier1"], CONTRACT_OWNER)
    const result = mockContractCall("verify-organism", [1], "verifier1")
    expect(result.success).toBe(true)
    const verificationStatus = mockContractCall("is-organism-verified", [1], "anyone").value
    expect(verificationStatus.is_verified).toBe(true)
    expect(verificationStatus.verifier).toBe("verifier1")
  })
  
  it("should not verify an organism if not a verifier", () => {
    const result = mockContractCall("verify-organism", [1], "user1")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should check if an organism is verified", () => {
    mockContractCall("add-verifier", ["verifier1"], CONTRACT_OWNER)
    mockContractCall("verify-organism", [1], "verifier1")
    const result = mockContractCall("is-organism-verified", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({ is_verified: true, verifier: "verifier1" })
  })
  
  it("should return false for unverified organisms", () => {
    const result = mockContractCall("is-organism-verified", [2], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({ is_verified: false, verifier: null })
  })
})

